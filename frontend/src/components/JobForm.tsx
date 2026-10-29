"use client";

import React, { useState } from "react";
import toast from "react-hot-toast";
import { jobApi, getErrorMessage } from "@/lib/api";
import { formatSalary } from "@/lib/utils";
import { Company, Job, JobType, WorkLocation, JOB_TYPES, WORK_LOCATIONS } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select } from "./ui/select";
import { Textarea } from "./ui/textarea";
import { Eye, Pencil, Send } from "lucide-react";

interface JobFormProps {
  companies: Company[];
  job?: Job;
  defaultCompanyId?: number;
  onSaved: (job: Job) => void;
  onCancel?: () => void;
}

// Mirrors the columns of the jobs table accepted by POST /create and PUT /update/:jobId
interface FormState {
  company_id: string;
  title: string;
  role: string;
  description: string;
  job_type: JobType;
  work_location: WorkLocation;
  location: string;
  salary: string;
  openings: string;
}

type FormErrors = Partial<Record<keyof FormState, string>>;

export const workLocationLabel = (w: string) => (w === "on-site" ? "On-site" : w);

function toFormState(job: Job | undefined, defaultCompanyId: number | undefined): FormState {
  return {
    company_id: String(job?.company_id ?? defaultCompanyId ?? ""),
    title: job?.title ?? "",
    role: job?.role ?? "",
    description: job?.description ?? "",
    job_type: (job?.job_type as JobType) ?? "Full-time",
    work_location: (job?.work_location as WorkLocation) ?? "on-site",
    location: job?.location ?? "",
    salary: job?.salary != null ? String(Number(job.salary)) : "",
    openings: job?.openings != null ? String(Number(job.openings)) : "1",
  };
}

export function JobForm({ companies, job, defaultCompanyId, onSaved, onCancel }: JobFormProps) {
  const [form, setForm] = useState<FormState>(() =>
    toFormState(job, defaultCompanyId ?? (companies.length === 1 ? companies[0].company_id : undefined))
  );
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [preview, setPreview] = useState(false);

  const update =
    (field: keyof FormState) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [field]: e.target.value }));

  const validate = () => {
    const e: FormErrors = {};
    if (!form.company_id) e.company_id = "Choose a company";
    if (!form.title.trim()) e.title = "Job title is required";
    if (!form.role.trim()) e.role = "Category / role is required";
    if (form.description.trim().length < 30) e.description = "Describe the job in at least 30 characters";
    if (!form.location.trim()) e.location = "Location is required";
    const salary = form.salary ? Number(form.salary) : null;
    if (salary !== null && (Number.isNaN(salary) || salary < 0)) e.salary = "Enter a positive number";
    // salary is NUMERIC(10,2) in the database
    else if (salary !== null && salary >= 1e8) e.salary = "Salary must be below 100,000,000";
    // openings is NUMERIC(3,1) in the database, so it must stay below 100
    const openings = Number(form.openings);
    if (!Number.isInteger(openings) || openings < 1 || openings > 99) e.openings = "Whole number from 1 to 99";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (submitting) return;
    if (!validate()) {
      setPreview(false);
      toast.error("Please fix the highlighted fields");
      return;
    }

    const payload = {
      title: form.title.trim(),
      role: form.role.trim(),
      description: form.description.trim(),
      location: form.location.trim(),
      salary: form.salary ? Number(form.salary) : null,
      openings: Number(form.openings),
      job_type: form.job_type,
      work_location: form.work_location,
      company_id: Number(form.company_id),
    };

    setSubmitting(true);
    try {
      const { data } = job
        ? await jobApi.put<{ job: Job }>(`/update/${job.job_id}`, payload)
        : await jobApi.post<{ job: Job }>("/create", payload);
      toast.success(job ? "Job updated" : "Job published");
      onSaved(data.job);
    } catch (err) {
      toast.error(getErrorMessage(err, "Could not save the job"));
    } finally {
      setSubmitting(false);
    }
  };

  const company = companies.find((c) => String(c.company_id) === form.company_id);

  const actions = (
    <div className="flex flex-wrap gap-2">
      <Button type="button" variant="outline" className="gap-2" onClick={() => setPreview((p) => !p)}>
        {preview ? <Pencil className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        {preview ? "Back to edit" : "Preview"}
      </Button>
      <Button type="button" variant="brand" className="gap-2" onClick={() => handleSubmit()} isLoading={submitting}>
        {!submitting && <Send className="h-4 w-4" />}
        {job ? "Save changes" : "Publish job"}
      </Button>
      {onCancel && (
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
      )}
    </div>
  );

  if (preview) {
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-primary">Preview · how candidates see it</p>
            <CardTitle className="text-2xl">{form.title || "Untitled job"}</CardTitle>
            <div className="flex flex-wrap gap-2">
              {company && <Badge variant="outline">{company.name}</Badge>}
              <Badge variant="secondary">{form.job_type}</Badge>
              <Badge variant="outline">{workLocationLabel(form.work_location)}</Badge>
              {form.role && <Badge variant="info">{form.role}</Badge>}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <dl className="grid grid-cols-3 gap-4 border-y border-border py-4 text-sm">
              <div>
                <dt className="text-xs uppercase text-muted-foreground">Location</dt>
                <dd className="font-medium">{form.location || "—"}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase text-muted-foreground">Salary</dt>
                <dd className="font-medium">{formatSalary(form.salary) ?? "Not disclosed"}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase text-muted-foreground">Openings</dt>
                <dd className="font-medium">{form.openings}</dd>
              </div>
            </dl>
            <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-line">{form.description}</p>
          </CardContent>
        </Card>
        {actions}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Job details</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-2">
            <Label htmlFor="job-company" required>
              Company
            </Label>
            <Select id="job-company" value={form.company_id} onChange={update("company_id")} error={errors.company_id}>
              <option value="">Select a company</option>
              {companies.map((c) => (
                <option key={c.company_id} value={c.company_id}>
                  {c.name}
                </option>
              ))}
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="job-title" required>
              Job title
            </Label>
            <Input id="job-title" value={form.title} onChange={update("title")} error={errors.title} placeholder="e.g. Senior Frontend Engineer" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="job-role" required>
              Category / role
            </Label>
            <Input id="job-role" value={form.role} onChange={update("role")} error={errors.role} placeholder="e.g. Engineering" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="job-location" required>
              Location
            </Label>
            <Input id="job-location" value={form.location} onChange={update("location")} error={errors.location} placeholder="e.g. Bengaluru" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="job-type" required>
              Employment type
            </Label>
            <Select id="job-type" value={form.job_type} onChange={update("job_type")}>
              {JOB_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="job-work-mode" required>
              Work mode
            </Label>
            <Select id="job-work-mode" value={form.work_location} onChange={update("work_location")}>
              {WORK_LOCATIONS.map((w) => (
                <option key={w} value={w}>
                  {workLocationLabel(w)}
                </option>
              ))}
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="job-salary">Salary (per year)</Label>
            <Input id="job-salary" type="number" min={0} value={form.salary} onChange={update("salary")} error={errors.salary} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="job-openings" required>
              Number of openings
            </Label>
            <Input id="job-openings" type="number" min={1} max={99} value={form.openings} onChange={update("openings")} error={errors.openings} />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="job-description" required>
              Job description
            </Label>
            <Textarea
              id="job-description"
              rows={10}
              value={form.description}
              onChange={update("description")}
              error={errors.description}
              placeholder="What the role involves, the skills you're looking for, and what you offer."
            />
          </div>
        </CardContent>
      </Card>

      {actions}
    </form>
  );
}
