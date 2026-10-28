"use client";

import React from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import {
  User,
  Mail,
  Phone,
  Briefcase,
  FileText,
  Calendar,
  LogOut,
  ExternalLink,
  Sparkles,
} from "lucide-react";

function ProfileContent() {
  const { user, logout } = useAuth();

  if (!user) {
    return null;
  }

  return (
    <div className="container max-w-4xl py-12 px-4 md:px-6 space-y-8">
      {/* Header Banner */}
      <Card className="border-border/80 overflow-hidden shadow-lg">
        <div className="h-32 bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-600" />
        <CardContent className="relative pt-0 pb-8 px-6 md:px-8">
          <div className="flex flex-col sm:flex-row items-center sm:items-end justify-between -mt-16 sm:-mt-12 gap-4 pb-4 border-b border-border/60">
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 text-center sm:text-left">
              <Avatar
                src={user.profile_pic}
                fallbackText={user.name}
                size="xl"
                className="h-24 w-24 ring-4 ring-background border-2 border-border shadow-md"
              />
              <div className="space-y-1">
                <h1 className="text-2xl md:text-3xl font-extrabold text-foreground">
                  {user.name}
                </h1>
                <p className="text-sm text-muted-foreground">{user.email}</p>
                <div className="pt-1 flex items-center justify-center sm:justify-start gap-2">
                  <Badge variant={user.role === "recruiter" ? "info" : "success"}>
                    {user.role === "recruiter" ? "Recruiter" : "Job Seeker"}
                  </Badge>
                  {user.subscription && (
                    <Badge variant="warning" className="gap-1 text-xs">
                      <Sparkles className="h-3 w-3" />
                      Pro Member
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            <Button
              variant="destructive"
              size="sm"
              onClick={logout}
              className="gap-2 shrink-0"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">
                Contact Information
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center space-x-3 text-muted-foreground">
                  <Mail className="h-4 w-4 text-primary" />
                  <span className="text-foreground">{user.email}</span>
                </div>
                <div className="flex items-center space-x-3 text-muted-foreground">
                  <Phone className="h-4 w-4 text-primary" />
                  <span className="text-foreground">{user.phone_number || "Not provided"}</span>
                </div>
                <div className="flex items-center space-x-3 text-muted-foreground">
                  <Calendar className="h-4 w-4 text-primary" />
                  <span className="text-foreground">
                    Member since {user.created_at ? new Date(user.created_at).toLocaleDateString() : "Recent"}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">
                Bio & Background
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {user.bio || "No professional summary provided yet."}
              </p>
            </div>
          </div>

          {/* Job Seeker Resume & Skills */}
          {user.role === "jobseeker" && (
            <div className="mt-8 pt-6 border-t border-border/60 space-y-6">
              {/* Skills */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">
                  Skills & Expertise
                </h3>
                {user.skills && user.skills.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {user.skills.map((skill, i) => (
                      <Badge key={i} variant="secondary" className="px-3 py-1 text-xs">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    No skills added yet. They will appear here once added or extracted from your resume.
                  </p>
                )}
              </div>

              {/* Resume */}
              {user.resume && (
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">
                    Uploaded Resume
                  </h3>
                  <a
                    href={user.resume}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="inline-flex items-center space-x-2 rounded-lg border border-border bg-muted/40 px-4 py-2.5 text-sm font-medium hover:bg-accent transition-colors"
                  >
                    <FileText className="h-4 w-4 text-primary" />
                    <span>View Resume Document</span>
                    <ExternalLink className="h-3.5 w-3.5 text-muted-foreground ml-1" />
                  </a>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
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
