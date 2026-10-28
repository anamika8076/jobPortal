"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { authApi, userApi, getErrorMessage } from "@/lib/api";
import { User, AuthResponse } from "@/types";

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<AuthResponse>;
  register: (payload: FormData | Record<string, unknown>) => Promise<AuthResponse>;
  logout: () => void;
  fetchUser: () => Promise<void>;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_COOKIE_KEY = "token";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();

  const fetchUser = useCallback(async (): Promise<void> => {
    const storedToken = Cookies.get(TOKEN_COOKIE_KEY);
    if (!storedToken) {
      setUser(null);
      setToken(null);
      setLoading(false);
      return;
    }

    setToken(storedToken);

    try {
      // User service: GET /api/user/me returns User object
      const response = await userApi.get<User>("/me");
      setUser(response.data);
    } catch (error) {
      console.warn("Failed to restore session via /api/user/me:", getErrorMessage(error));
      Cookies.remove(TOKEN_COOKIE_KEY);
      setUser(null);
      setToken(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const login = async (email: string, password: string): Promise<AuthResponse> => {
    try {
      const response = await authApi.post<AuthResponse>("/login", { email, password });
      const { token: receivedToken, userObject } = response.data;

      if (receivedToken) {
        Cookies.set(TOKEN_COOKIE_KEY, receivedToken, {
          expires: 15,
          sameSite: "lax",
          secure: process.env.NODE_ENV === "production",
        });
        setToken(receivedToken);
      }

      if (userObject) {
        setUser(userObject);
      } else if (receivedToken) {
        // Fallback to fetch /me if userObject wasn't in response
        await fetchUser();
      }

      return response.data;
    } catch (error) {
      throw error;
    }
  };

  const register = async (payload: FormData | Record<string, unknown>): Promise<AuthResponse> => {
    try {
      const isFormData = typeof FormData !== "undefined" && payload instanceof FormData;
      const headers = isFormData
        ? { "Content-Type": "multipart/form-data" }
        : { "Content-Type": "application/json" };

      const response = await authApi.post<AuthResponse>("/register", payload, { headers });
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  const logout = useCallback(() => {
    Cookies.remove(TOKEN_COOKIE_KEY);
    setUser(null);
    setToken(null);
    router.push("/login");
  }, [router]);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        fetchUser,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
