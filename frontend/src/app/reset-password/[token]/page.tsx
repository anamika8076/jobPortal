"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { authApi, getErrorMessage } from "@/lib/api";
import { GuestRoute } from "@/components/GuestRoute";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import toast from "react-hot-toast";
import { Lock, Eye, EyeOff, CheckCircle2, ArrowRight } from "lucide-react";

export default function ResetPasswordPage() {
  const router = useRouter();
  const params = useParams();
  const token = params?.token as string;

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!token) {
      newErrors.token = "Reset token is missing from the URL.";
    }

    if (!password) {
      newErrors.password = "New password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Backend route: POST /api/auth/reset/:token with body { password }
      const response = await authApi.post<{ message: string }>(`/reset/${token}`, {
        password,
      });

      setIsSuccess(true);
      toast.success(response.data?.message || "Password changed successfully!");

      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (err) {
      const message = getErrorMessage(err, "Failed to reset password. Link may have expired.");
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
              <Lock className="h-6 w-6" />
            </div>
            <CardTitle className="text-2xl font-extrabold tracking-tight">
              Create New Password
            </CardTitle>
            <CardDescription className="text-muted-foreground text-sm">
              Enter and confirm your new secure password.
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-6">
            {isSuccess ? (
              <div className="space-y-6 text-center">
                <div className="mx-auto h-16 w-16 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <CheckCircle2 className="h-8 w-8" />
                </div>
                <div className="space-y-2">
                  <h4 className="text-lg font-semibold text-foreground">
                    Password Reset Complete
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Your password has been updated. Redirecting you to sign in...
                  </p>
                </div>
                <Link href="/login" className="block w-full">
                  <Button variant="gradient" className="w-full gap-2">
                    <span>Proceed to Sign In</span>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                {errors.token && (
                  <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-xs border border-destructive/20">
                    {errors.token}
                  </div>
                )}

                {/* New Password */}
                <div className="space-y-2">
                  <Label htmlFor="password" required>
                    New Password
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
                      autoComplete="new-password"
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

                {/* Confirm Password */}
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" required>
                    Confirm New Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="confirmPassword"
                      type={showPassword ? "text" : "password"}
                      placeholder="Repeat your new password"
                      className="pl-9"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      error={errors.confirmPassword}
                      autoComplete="new-password"
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
                  <Lock className="h-4 w-4" />
                  <span>Update Password</span>
                </Button>

                <p className="text-center text-sm text-muted-foreground pt-2">
                  Remember your password?{" "}
                  <Link
                    href="/login"
                    className="font-semibold text-primary hover:underline underline-offset-4"
                  >
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
