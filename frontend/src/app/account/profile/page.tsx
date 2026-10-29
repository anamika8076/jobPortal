"use client";

import React, { useRef, useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";
import { userApi, getErrorMessage, multipartConfig } from "@/lib/api";
import { PageHeader, SectionCard } from "@/components/shell/DashboardUI";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ExternalLink, FileText, Mail, Phone, Plus, Upload, X } from "lucide-react";

const MAX_RESUME_BYTES = 5 * 1024 * 1024;

export default function ResumeAndSkillsPage() {
  const { user, fetchUser } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [newSkill, setNewSkill] = useState("");
  const [skillBusy, setSkillBusy] = useState(false);
  const resumeRef = useRef<HTMLInputElement>(null);

  if (!user) return null;

  const uploadResume = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || uploading) return;
    if (file.type !== "application/pdf") {
      toast.error("Please upload your resume as a PDF");
      return;
    }
    if (file.size > MAX_RESUME_BYTES) {
      toast.error("Resume must be smaller than 5 MB");
      return;
    }
    const formData = new FormData();
    formData.append("file", file);
    setUploading(true);
    try {
      await userApi.put("/update/resume", formData, multipartConfig);
      await fetchUser();
      toast.success("Resume updated");
    } catch (err) {
      toast.error(getErrorMessage(err, "Could not upload your resume"));
    } finally {
      setUploading(false);
    }
  };

  const addSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    const skillName = newSkill.trim();
    if (!skillName || skillBusy) return;
    if (user.skills.some((s) => s.toLowerCase() === skillName.toLowerCase())) {
      toast.error("You've already added that skill");
      return;
    }
    setSkillBusy(true);
    try {
      await userApi.post("/skill/add", { skillName });
      await fetchUser();
      setNewSkill("");
    } catch (err) {
      toast.error(getErrorMessage(err, "Could not add skill"));
    } finally {
      setSkillBusy(false);
    }
  };

  const removeSkill = async (skillName: string) => {
    if (skillBusy) return;
    setSkillBusy(true);
    try {
      await userApi.delete("/skill/delete", { data: { skillName } });
      await fetchUser();
    } catch (err) {
      toast.error(getErrorMessage(err, "Could not remove skill"));
    } finally {
      setSkillBusy(false);
    }
  };

  return (
    <>
      <PageHeader title="Resume & Skills" description="What recruiters see when you apply. Your resume is attached to every application." />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          <SectionCard title="Resume">
            {user.resume ? (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-lg border border-border p-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <FileText className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-foreground">Current resume</p>
                    <a
                      href={user.resume}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                    >
                      Open PDF <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>
                <Button variant="outline" className="gap-2" onClick={() => resumeRef.current?.click()} isLoading={uploading}>
                  {!uploading && <Upload className="h-4 w-4" />}
                  Replace
                </Button>
              </div>
            ) : (
              <div className="rounded-lg border border-dashed border-input p-6 text-center space-y-3">
                <p className="text-sm text-muted-foreground">You need a resume before you can apply for jobs.</p>
                <Button className="gap-2" onClick={() => resumeRef.current?.click()} isLoading={uploading}>
                  {!uploading && <Upload className="h-4 w-4" />}
                  Upload resume
                </Button>
              </div>
            )}
            <p className="mt-3 text-xs text-muted-foreground">
              PDF, up to 5 MB. Applications you&apos;ve already sent keep the resume they were sent with.{" "}
              <Link href="/account/resume-check" className="text-primary hover:underline">
                Check your resume
              </Link>
            </p>
            <input ref={resumeRef} type="file" accept="application/pdf" className="sr-only" onChange={uploadResume} tabIndex={-1} />
          </SectionCard>

          <SectionCard title="Skills">
            {user.skills.length > 0 ? (
              <ul className="flex flex-wrap gap-2 mb-4">
                {user.skills.map((skill) => (
                  <li key={skill}>
                    <Badge variant="secondary" className="gap-1 pl-3 pr-1.5 py-1 text-sm font-medium">
                      {skill}
                      <button
                        type="button"
                        onClick={() => removeSkill(skill)}
                        disabled={skillBusy}
                        className="rounded-full p-0.5 hover:bg-foreground/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        aria-label={`Remove ${skill}`}
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </Badge>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground mb-4">
                No skills yet. Recruiters can search candidates by skill, and the Career Advisor uses them too.
              </p>
            )}
            <form onSubmit={addSkill} className="flex gap-2 max-w-md">
              <Input aria-label="New skill" placeholder="e.g. React" value={newSkill} onChange={(e) => setNewSkill(e.target.value)} />
              <Button type="submit" variant="outline" className="gap-1.5 shrink-0" isLoading={skillBusy} disabled={!newSkill.trim()}>
                {!skillBusy && <Plus className="h-4 w-4" />}
                Add
              </Button>
            </form>
          </SectionCard>
        </div>

        <SectionCard
          title="How recruiters see you"
          action={
            <Link href="/account/settings" className="text-xs font-medium text-primary hover:underline">
              Edit details
            </Link>
          }
        >
          <div className="flex items-center gap-3">
            <Avatar src={user.profile_pic} fallbackText={user.name} size="lg" />
            <div className="min-w-0">
              <p className="font-semibold text-foreground truncate capitalize">{user.name}</p>
              <p className="text-xs text-muted-foreground">Job seeker</p>
            </div>
          </div>
          <ul className="mt-4 space-y-2 text-sm">
            <li className="flex items-center gap-2 text-muted-foreground">
              <Mail className="h-4 w-4 shrink-0" />
              <span className="truncate">{user.email}</span>
            </li>
            <li className="flex items-center gap-2 text-muted-foreground">
              <Phone className="h-4 w-4 shrink-0" />
              {user.phone_number || "No phone number"}
            </li>
          </ul>
          <p className="mt-4 text-sm text-muted-foreground whitespace-pre-line">{user.bio || "No bio yet."}</p>
        </SectionCard>
      </div>
    </>
  );
}
