"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { UserRole } from "@/types";
import { LoadingState } from "./StatusViews";

// Keeps old URLs working after pages moved into /account or /dashboard
export function RoleRedirect({ to }: { to: Record<UserRole, string> }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    router.replace(user ? to[user.role] : "/login");
  }, [loading, user, to, router]);

  return <LoadingState label="Redirecting..." />;
}
