"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { getErrorMessage } from "@/lib/api";
import { GuestRoute } from "@/components/GuestRoute";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import toast from "react-hot-toast";
import {
  Briefcase,
  User,
  Mail,
  Lock,
  Phone,
  FileText,
  Eye,
  EyeOff,
  UploadCloud,
  Check,
  Sparkles,
  Camera,
} from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();

  const [role, setRole] = useState<"jobseeker" | "recruiter">("jobseeker");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [bio, setBio] = useState("");
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [profilePicFile, setProfilePicFile] = useState<File | null>(null);
  const [profilePicPreview, setProfilePicPreview] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = "Full name is required";
    } else if (name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }

    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (!phoneNumber.trim()) {
      newErrors.phoneNumber = "Phone number is required";
    } else if (phoneNumber.trim().length < 8) {
      newErrors.phoneNumber = "Please enter a valid phone number";
    }

    if (role === "jobseeker" && !resumeFile) {
      newErrors.resume = "Resume PDF is required for job seekers";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleResumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      toast.error("Please upload a PDF document for your resume");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("Resume file size should not exceed 10MB");
      return;
    }

    setResumeFile(file);
    if (errors.resume) {
      setErrors((prev) => {
        const rest = { ...prev };
        delete rest.resume;
        return rest;
      });
    }
  };

  const handleProfilePicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file (JPG, PNG, WebP)");
      return;
    }

    setProfilePicFile(file);
    const reader = new FileReader();
    reader.onload = () => {
      setProfilePicPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      toast.error("Please resolve the errors highlighted below");
      return;
    }

    setIsSubmitting(true);

    try {
      // Backend expects multipart/form-data with fields:
      // name, email, password, phoneNumber, role, bio, and single file as "file" (the resume for jobseeker)
      const formData = new FormData();
      formData.append("name", name.trim());
      formData.append("email", email.trim().toLowerCase());
      formData.append("password", password);
      formData.append("phoneNumber", phoneNumber.trim());
      formData.append("role", role);
      if (bio.trim()) {
        formData.append("bio", bio.trim());
      }

      if (role === "jobseeker" && resumeFile) {
        formData.append("file", resumeFile);
      }

      await register(formData);

      toast.success("Account created successfully! Please sign in.");
      router.push("/login");
    } catch (error) {
      const message = getErrorMessage(error, "Failed to register account");
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <GuestRoute>
      <div className="container max-w-2xl py-12 px-4 md:px-6">
        <Card className="border-border/80 shadow-xl">
          <CardHeader className="space-y-2 text-center pb-6 border-b border-border/50">
            <div className="mx-auto h-12 w-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-1">
              <Briefcase className="h-6 w-6" />
            </div>
            <CardTitle className="text-2xl md:text-3xl font-extrabold tracking-tight">
              Create your HireHeaven account
            </CardTitle>
            <CardDescription className="text-muted-foreground text-sm">
              Join thousands of job seekers and verified recruiters today.
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Role Selection */}
              <div className="space-y-2">
                <Label required>I want to register as</Label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setRole("jobseeker")}
                    className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${
                      role === "jobseeker"
                        ? "border-primary bg-primary/5 text-primary shadow-sm"
                        : "border-border hover:border-border/80 bg-card text-muted-foreground"
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <User className="h-5 w-5" />
                      <span className="font-semibold text-sm">Job Seeker</span>
                    </div>
                    <span className="text-xs text-muted-foreground mt-1 text-center">
                      Explore jobs & apply
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRole("recruiter")}
                    className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${
                      role === "recruiter"
                        ? "border-primary bg-primary/5 text-primary shadow-sm"
                        : "border-border hover:border-border/80 bg-card text-muted-foreground"
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <Briefcase className="h-5 w-5" />
                      <span className="font-semibold text-sm">Recruiter</span>
                    </div>
                    <span className="text-xs text-muted-foreground mt-1 text-center">
                      Post jobs & hire talent
                    </span>
                  </button>
                </div>
              </div>

              {/* Full Name */}
              <div className="space-y-2">
                <Label htmlFor="name" required>
                  Full Name
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="name"
                    placeholder="e.g. Alex Morgan"
                    className="pl-9"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    error={errors.name}
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" required>
                  Email Address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="alex@example.com"
                    className="pl-9"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    error={errors.email}
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password" required>
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="At least 6 characters"
                    className="pl-9 pr-10"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    error={errors.password}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Phone Number */}
              <div className="space-y-2">
                <Label htmlFor="phoneNumber" required>
                  Phone Number
                </Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="phoneNumber"
                    type="tel"
                    placeholder="+1 (555) 000-0000"
                    className="pl-9"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    error={errors.phoneNumber}
                  />
                </div>
              </div>

              {/* Short Bio */}
              <div className="space-y-2">
                <Label htmlFor="bio">Bio / Summary (Optional)</Label>
                <textarea
                  id="bio"
                  rows={2}
                  placeholder="Tell us a little about your professional background..."
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                />
              </div>

              {/* Job Seeker specific uploads: Resume and Profile Photo */}
              {role === "jobseeker" && (
                <div className="space-y-5 pt-2 border-t border-border/60">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-foreground">
                      Candidate Documents & Photo
                    </span>
                    <Badge variant="info" className="text-xs">
                      Required for Job Seekers
                    </Badge>
                  </div>

                  {/* Resume Upload */}
                  <div className="space-y-2">
                    <Label required>Resume (PDF format)</Label>
                    <div
                      className={`relative border-2 border-dashed rounded-xl p-5 text-center transition-colors ${
                        resumeFile
                          ? "border-primary/50 bg-primary/5"
                          : errors.resume
                          ? "border-destructive bg-destructive/5"
                          : "border-border hover:border-primary/40 bg-muted/20"
                      }`}
                    >
                      <input
                        type="file"
                        accept="application/pdf"
                        id="resume-upload"
                        onChange={handleResumeChange}
                        className="sr-only"
                      />
                      <label
                        htmlFor="resume-upload"
                        className="cursor-pointer flex flex-col items-center space-y-2"
                      >
                        {resumeFile ? (
                          <div className="flex items-center space-x-2 text-primary font-medium text-sm">
                            <Check className="h-5 w-5 text-emerald-500" />
                            <span className="truncate max-w-xs">{resumeFile.name}</span>
                            <span className="text-xs text-muted-foreground">
                              ({(resumeFile.size / 1024 / 1024).toFixed(2)} MB)
                            </span>
                          </div>
                        ) : (
                          <>
                            <UploadCloud className="h-8 w-8 text-muted-foreground" />
                            <div className="text-sm font-medium text-foreground">
                              Click to upload your resume
                            </div>
                            <p className="text-xs text-muted-foreground">
                              Supports PDF up to 10MB
                            </p>
                          </>
                        )}
                      </label>
                    </div>
                    {errors.resume && (
                      <p className="text-xs text-destructive">{errors.resume}</p>
                    )}
                  </div>

                  {/* Profile Photo Upload */}
                  <div className="space-y-2">
                    <Label>Profile Photo (Optional)</Label>
                    <div className="flex items-center space-x-4">
                      <div className="relative h-16 w-16 rounded-full overflow-hidden border-2 border-border bg-muted flex items-center justify-center shrink-0">
                        {profilePicPreview ? (
                          <img
                            src={profilePicPreview}
                            alt="Profile preview"
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <Camera className="h-6 w-6 text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex-1">
                        <input
                          type="file"
                          accept="image/*"
                          id="pic-upload"
                          onChange={handleProfilePicChange}
                          className="sr-only"
                        />
                        <label
                          htmlFor="pic-upload"
                          className="inline-flex cursor-pointer items-center justify-center rounded-md border border-input bg-background px-3 py-1.5 text-xs font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
                        >
                          {profilePicFile ? "Change Photo" : "Upload Photo"}
                        </label>
                        <p className="text-xs text-muted-foreground mt-1">
                          PNG, JPG, or WebP under 5MB.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                variant="gradient"
                size="lg"
                className="w-full gap-2 text-base font-semibold"
                isLoading={isSubmitting}
              >
                <Sparkles className="h-4 w-4" />
                <span>Create {role === "recruiter" ? "Recruiter" : "Job Seeker"} Account</span>
              </Button>

              {/* Sign In Link */}
              <p className="text-center text-sm text-muted-foreground pt-2">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="font-semibold text-primary hover:underline underline-offset-4"
                >
                  Sign in
                </Link>
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </GuestRoute>
  );
}
