"use client";

import React, { useState } from "react";
import Link from "next/link";
import { authApi, getErrorMessage } from "@/lib/api";
import { GuestRoute } from "@/components/GuestRoute";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import toast from "react-hot-toast";
import { Mail, ArrowLeft, CheckCircle2, Send } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim()) {
      setError("Please enter your email address");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Please enter a valid email address");
      return;
    }

    setIsSubmitting(true);

    try {
      // Backend auth route: POST /api/auth/forgot with { email }
      const response = await authApi.post<{ message: string }>("/forgot", {
        email: email.trim().toLowerCase(),
      });

      setIsSubmitted(true);
      toast.success(response.data?.message || "Reset link dispatched if email exists!");
    } catch (err) {
      const message = getErrorMessage(err, "Failed to send reset email");
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <GuestRoute>
      <div className="container max-w-md py-14 px-4 md:px-6">
        <Card className="border-border/80 shadow-xl">
          <CardHeader className="space-y-2 text-center pb-6 border-b border-border/50">
            <div className="mx-auto h-12 w-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-1">
              <Mail className="h-6 w-6" />
            </div>
            <CardTitle className="text-2xl font-extrabold tracking-tight">
              Reset Your Password
            </CardTitle>
            <CardDescription className="text-muted-foreground text-sm">
              Enter your registered email and we&apos;ll send you instructions to reset your password.
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-6">
            {isSubmitted ? (
              <div className="space-y-6 text-center">
                <div className="mx-auto h-16 w-16 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <CheckCircle2 className="h-8 w-8" />
                </div>
                <div className="space-y-2">
                  <h4 className="text-lg font-semibold text-foreground">
                    Check your inbox
                  </h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    If an account is associated with <span className="font-medium text-foreground">{email}</span>, you will receive an email containing your password reset link.
                  </p>
                </div>

                <div className="rounded-lg bg-muted/50 p-4 border border-border/50 text-xs text-muted-foreground text-left space-y-1">
                  <p className="font-semibold text-foreground">Didn&apos;t receive it?</p>
                  <p>Check your spam or junk folder, or verify the email you entered.</p>
                </div>

                <div className="space-y-2 pt-2">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      setIsSubmitted(false);
                      setEmail("");
                    }}
                  >
                    Try another email
                  </Button>
                  <Link href="/login" className="block w-full">
                    <Button variant="ghost" className="w-full gap-2">
                      <ArrowLeft className="h-4 w-4" />
                      Back to sign in
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="email" required>
                    Email Address
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="name@example.com"
                      className="pl-9"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (error) setError(null);
                      }}
                      error={error || undefined}
                      autoComplete="email"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  variant="gradient"
                  size="lg"
                  className="w-full gap-2 text-base font-semibold"
                  isLoading={isSubmitting}
                >
                  <Send className="h-4 w-4" />
                  <span>Send Reset Link</span>
                </Button>

                <p className="text-center text-sm text-muted-foreground pt-2">
                  <Link
                    href="/login"
                    className="inline-flex items-center gap-1.5 font-medium text-primary hover:underline underline-offset-4"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back to sign in
                  </Link>
                </p>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </GuestRoute>
  );
}
