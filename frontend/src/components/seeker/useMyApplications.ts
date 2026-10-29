"use client";

import { useCallback, useEffect, useState } from "react";
import { userApi, getErrorMessage } from "@/lib/api";
import { Application } from "@/types";

// The signed-in job seeker's applications from GET /api/user/application/all, newest first
export function useMyApplications() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await userApi.get<Application[]>("/application/all");
      setApplications(
        [...data].sort((a, b) => new Date(b.applied_at ?? 0).getTime() - new Date(a.applied_at ?? 0).getTime())
      );
    } catch (err) {
      setError(getErrorMessage(err, "Could not load your applications"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  return { applications, loading, error, reload };
}
