"use client";

import React, { useRef, useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";
import { userApi, getErrorMessage, multipartConfig } from "@/lib/api";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Mail,
  Phone,
  FileText,
  LogOut,
  ExternalLink,
  BadgeCheck,
  FileSearch,
  Camera,
  Pencil,
  Upload,
  X,
  Plus,
  ClipboardList,
  LayoutDashboard,
} from "lucide-react";

function ProfileContent() {
  const { user, logout, fetchUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user?.name ?? "");
  const [phoneNumber, setPhoneNumber] = useState(user?.phone_number ?? "");
  const [bio, setBio] = useState(user?.bio ?? "");
  const [saving, setSaving] = useState(false);
  const [uploadingPic, setUploadingPic] = useState(false);
  const [uploadingResume, setUploadingResume] = useState(false);
  const [newSkill, setNewSkill] = useState("");
  const [skillBusy, setSkillBusy] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; phoneNumber?: string }>({});
  const picInputRef = useRef<HTMLInputElement>(null);
  const resumeInputRef = useRef<HTMLInputElement>(null);

  if (!user) {
    return null;
  }

  const startEditing = () => {
    setName(user.name);
    setPhoneNumber(user.phone_number ?? "");
    setBio(user.bio ?? "");
    setErrors({});
    setEditing(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: typeof errors = {};
    if (!name.trim()) newErrors.name = "Name is required";
    if (!phoneNumber.trim()) newErrors.phoneNumber = "Phone number is required";
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setSaving(true);
    try {
      await userApi.put("/update/profile", {
        name: name.trim(),
        phoneNumber: phoneNumber.trim(),
        bio: bio.trim(),
      });
      await fetchUser();
      toast.success("Profile updated");
      setEditing(false);
    } catch (err) {
      toast.error(getErrorMessage(err, "Could not update profile"));
    } finally {
      setSaving(false);
    }
  };

  const uploadFile = async (
    file: File,
    endpoint: "/update/pic" | "/update/resume",
    setBusy: (busy: boolean) => void,
    successMessage: string
  ) => {
    const formData = new FormData();
    formData.append("file", file);
    setBusy(true);
    try {
      await userApi.put(endpoint, formData, multipartConfig);
      await fetchUser();
      toast.success(successMessage);
    } catch (err) {
      toast.error(getErrorMessage(err, "Upload failed"));
    } finally {
      setBusy(false);
    }
  };

  const handlePicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file (JPG, PNG, WebP)");
      return;
    }
    uploadFile(file, "/update/pic", setUploadingPic, "Profile photo updated");
  };

  const handleResumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (file.type !== "application/pdf") {
      toast.error("Please upload your resume as a PDF");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Resume must be smaller than 5 MB");
      return;
    }
    uploadFile(file, "/update/resume", setUploadingResume, "Resume updated");
  };

  const handleAddSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    const skillName = newSkill.trim();
    if (!skillName) return;
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

  const handleRemoveSkill = async (skillName: string) => {
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

  const isJobseeker = user.role === "jobseeker";

  return (
    <div className="container max-w-4xl py-12 px-4 md:px-6 space-y-8">
      {/* Header Banner */}
      <Card className="border-border/80 overflow-hidden shadow-lg">
        <div className="h-28 bg-muted border-b border-border" />
        <CardContent className="relative pt-0 pb-8 px-6 md:px-8">
          <div className="flex flex-col sm:flex-row items-center sm:items-end justify-between -mt-16 sm:-mt-12 gap-4 pb-4 border-b border-border/60">
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 text-center sm:text-left">
              <div className="relative">
                <Avatar
                  src={user.profile_pic}
                  fallbackText={user.name}
                  size="xl"
                  className="h-24 w-24 ring-4 ring-background border-2 border-border shadow-md"
                />
                <button
                  type="button"
                  onClick={() => picInputRef.current?.click()}
                  disabled={uploadingPic}
                  className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-md hover:bg-primary/90 disabled:opacity-60"
                  aria-label="Change profile photo"
                >
                  <Camera className={`h-4 w-4 ${uploadingPic ? "animate-pulse" : ""}`} />
                </button>
                <input ref={picInputRef} type="file" accept="image/*" className="hidden" onChange={handlePicChange} />
              </div>
              <div className="space-y-1">
                <h1 className="text-2xl md:text-3xl font-extrabold text-foreground">{user.name}</h1>
                <p className="text-sm text-muted-foreground">{user.email}</p>
                <div className="pt-1 flex items-center justify-center sm:justify-start gap-2">
                  <Badge variant={user.role === "recruiter" ? "info" : "success"}>
                    {user.role === "recruiter" ? "Recruiter" : "Job Seeker"}
                  </Badge>
                  {user.subscription && (
                    <Badge variant="warning" className="gap-1 text-xs">
                      <BadgeCheck className="h-3 w-3" />
                      Pro Member
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-2 shrink-0">
              {!editing && (
                <Button variant="outline" size="sm" onClick={startEditing} className="gap-2">
                  <Pencil className="h-4 w-4" />
                  Edit
                </Button>
              )}
              <Button variant="destructive" size="sm" onClick={logout} className="gap-2">
                <LogOut className="h-4 w-4" />
                Sign Out
              </Button>
            </div>
          </div>

          {editing ? (
            <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-6">
              <div className="space-y-2">
                <Label htmlFor="name" required>
                  Full Name
                </Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} error={errors.name} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone" required>
                  Phone Number
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  error={errors.phoneNumber}
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea id="bio" rows={4} value={bio} onChange={(e) => setBio(e.target.value)} />
              </div>
              <div className="flex gap-2 md:col-span-2">
                <Button type="submit" variant="gradient" isLoading={saving}>
                  Save changes
                </Button>
                <Button type="button" variant="ghost" onClick={() => setEditing(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">
                  Contact Information
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center space-x-3">
                    <Mail className="h-4 w-4 text-primary" />
                    <span className="text-foreground">{user.email}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Phone className="h-4 w-4 text-primary" />
                    <span className="text-foreground">{user.phone_number || "Not provided"}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">
                  Bio & Background
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                  {user.bio || "No professional summary provided yet."}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {isJobseeker ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Skills */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Skills & Expertise</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {user.skills.length > 0 ? (
                <ul className="flex flex-wrap gap-2">
                  {user.skills.map((skill) => (
                    <li key={skill}>
                      <Badge variant="secondary" className="gap-1 pl-3 pr-1.5 py-1 text-xs">
                        {skill}
                        <button
                          type="button"
                          onClick={() => handleRemoveSkill(skill)}
                          disabled={skillBusy}
                          className="rounded-full p-0.5 hover:bg-foreground/10"
                          aria-label={`Remove ${skill}`}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-muted-foreground">No skills yet. Add a few so we can suggest careers.</p>
              )}
              <form onSubmit={handleAddSkill} className="flex gap-2">
                <Input
                  aria-label="New skill"
                  placeholder="e.g. React"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                />
                <Button type="submit" variant="outline" isLoading={skillBusy} disabled={!newSkill.trim()}>
                  <Plus className="h-4 w-4" />
                  <span className="sr-only">Add skill</span>
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Resume */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Resume</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {user.resume ? (
                <a
                  href={user.resume}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="inline-flex items-center space-x-2 rounded-lg border border-border bg-muted/40 px-4 py-2.5 text-sm font-medium hover:bg-accent transition-colors"
                >
                  <FileText className="h-4 w-4 text-primary" />
                  <span>View current resume</span>
                  <ExternalLink className="h-3.5 w-3.5 text-muted-foreground ml-1" />
                </a>
              ) : (
                <p className="text-xs text-muted-foreground">No resume uploaded. You need one to apply for jobs.</p>
              )}
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  className="gap-2"
                  onClick={() => resumeInputRef.current?.click()}
                  isLoading={uploadingResume}
                >
                  <Upload className="h-4 w-4" />
                  {user.resume ? "Replace resume" : "Upload resume"}
                </Button>
                <Link href="/ai">
                  <Button variant="gradient" className="gap-2">
                    <FileSearch className="h-4 w-4" />
                    Analyse with AI
                  </Button>
                </Link>
              </div>
              <input
                ref={resumeInputRef}
                type="file"
                accept="application/pdf"
                className="hidden"
                onChange={handleResumeChange}
              />
            </CardContent>
          </Card>

          <Link href="/applications" className="md:col-span-2">
            <Card className="hover:border-primary/50 transition-colors">
              <CardContent className="p-5 flex items-center gap-3">
                <ClipboardList className="h-5 w-5 text-primary" />
                <span className="font-medium">View my applications</span>
              </CardContent>
            </Card>
          </Link>
        </div>
      ) : (
        <Link href="/dashboard">
          <Card className="hover:border-primary/50 transition-colors">
            <CardContent className="p-5 flex items-center gap-3">
              <LayoutDashboard className="h-5 w-5 text-primary" />
              <span className="font-medium">Go to recruiter dashboard</span>
            </CardContent>
          </Card>
        </Link>
      )}
    </div>
  );
}

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <ProfileContent />
    </ProtectedRoute>
  );
}
