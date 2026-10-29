"use client";

import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { jobApi, userApi, getErrorMessage } from "@/lib/api";
import {
  Application,
  ApplicationStatus,
  Company,
  RecruiterApplication,
  RecruiterJob,
  User,
} from "@/types";

interface RecruiterDataContextType {
  companies: Company[];
  jobs: RecruiterJob[];
  applications: RecruiterApplication[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  profiles: Record<number, User>;
  loadProfiles: (userIds: number[]) => void;
  updateApplicationStatus: (applicationId: number, status: ApplicationStatus) => Promise<void>;
  setJobActive: (jobId: number, isActive: boolean) => Promise<void>;
}

const RecruiterDataContext = createContext<RecruiterDataContextType | undefined>(undefined);

export function RecruiterDataProvider({ children }: { children: React.ReactNode }) {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [jobs, setJobs] = useState<RecruiterJob[]>([]);
  const [applications, setApplications] = useState<RecruiterApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profiles, setProfiles] = useState<Record<number, User>>({});
  const requestedProfiles = useRef<Set<number>>(new Set());

  // There is no single "my dashboard" endpoint, so this walks
  // companies -> company details (jobs) -> applications per job.
  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: companyList } = await jobApi.get<Company[]>("/company/all");
      const details = await Promise.all(
        companyList.map((c) => jobApi.get<Company>(`/company/${c.company_id}`).then((r) => r.data))
      );

      const allJobs: RecruiterJob[] = details.flatMap((company) =>
        (company.jobs ?? []).map((job) => ({
          ...job,
          company_name: company.name,
          company_logo: company.logo,
        }))
      );

      const perJob = await Promise.all(
        allJobs.map((job) =>
          jobApi.get<Application[]>(`/applications/${job.job_id}`).then((r) =>
            r.data.map(
              (a): RecruiterApplication => ({
                ...a,
                applicant_email: a.applicant_email ?? "",
                job_title: job.title,
                company_id: job.company_id,
                company_name: job.company_name,
              })
            )
          )
        )
      );

      setCompanies(details);
      setJobs(allJobs);
      setApplications(perJob.flat());
    } catch (err) {
      setError(getErrorMessage(err, "Could not load your recruiter data"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const loadProfiles = useCallback((userIds: number[]) => {
    const missing = Array.from(new Set(userIds)).filter((id) => !requestedProfiles.current.has(id));
    if (missing.length === 0) return;
    missing.forEach((id) => requestedProfiles.current.add(id));

    Promise.allSettled(missing.map((id) => userApi.get<User>(`/${id}`))).then((results) => {
      const loaded: Record<number, User> = {};
      results.forEach((result, i) => {
        if (result.status === "fulfilled") loaded[result.value.data.user_id] = result.value.data;
        else requestedProfiles.current.delete(missing[i]);
      });
      setProfiles((prev) => ({ ...prev, ...loaded }));
    });
  }, []);

  // State changes only after the backend confirms the update
  const updateApplicationStatus = useCallback(async (applicationId: number, status: ApplicationStatus) => {
    const { data } = await jobApi.put<{ updatedApplication: Application }>(
      `/application/update/${applicationId}`,
      { status }
    );
    const confirmed = data.updatedApplication?.status ?? status;
    setApplications((prev) =>
      prev.map((a) => (a.application_id === applicationId ? { ...a, status: confirmed } : a))
    );
  }, []);

  const setJobActive = useCallback(async (jobId: number, isActive: boolean) => {
    const { data } = await jobApi.put<{ job: RecruiterJob }>(`/update/${jobId}`, { is_active: isActive });
    setJobs((prev) =>
      prev.map((j) => (j.job_id === jobId ? { ...j, is_active: data.job?.is_active ?? isActive } : j))
    );
  }, []);

  return (
    <RecruiterDataContext.Provider
      value={{
        companies,
        jobs,
        applications,
        loading,
        error,
        refresh,
        profiles,
        loadProfiles,
        updateApplicationStatus,
        setJobActive,
      }}
    >
      {children}
    </RecruiterDataContext.Provider>
  );
}

export function useRecruiterData(): RecruiterDataContextType {
  const context = useContext(RecruiterDataContext);
  if (!context) {
    throw new Error("useRecruiterData must be used within a RecruiterDataProvider");
  }
  return context;
}
