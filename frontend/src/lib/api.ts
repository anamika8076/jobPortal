import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from "axios";
import Cookies from "js-cookie";

const isBrowser = typeof window !== "undefined";

function buildServiceUrl(envUrl: string | undefined, defaultPort: number, apiPath: string): string {
  // In the browser, use relative paths so Next.js rewrites proxy requests seamlessly without CORS issues
  if (isBrowser) {
    return apiPath;
  }

  const raw = envUrl || `http://localhost:${defaultPort}`;
  const trimmed = raw.replace(/\/+$/, "");
  if (trimmed.endsWith(apiPath)) {
    return trimmed;
  }
  return `${trimmed}${apiPath}`;
}

const AUTH_URL = buildServiceUrl(process.env.NEXT_PUBLIC_AUTH_URL, 3000, "/api/auth");
const USER_URL = buildServiceUrl(process.env.NEXT_PUBLIC_USER_URL, 3002, "/api/user");
const JOB_URL = buildServiceUrl(process.env.NEXT_PUBLIC_JOB_URL, 3003, "/api/job");
const UTILS_URL = buildServiceUrl(process.env.NEXT_PUBLIC_UTILS_URL, 3001, "/api/utils");

function attachAuthInterceptor(instance: AxiosInstance): AxiosInstance {
  instance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      const token = Cookies.get("token");
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  return instance;
}

export const authApi = attachAuthInterceptor(
  axios.create({
    baseURL: AUTH_URL,
    headers: {
      "Content-Type": "application/json",
    },
  })
);

export const userApi = attachAuthInterceptor(
  axios.create({
    baseURL: USER_URL,
    headers: {
      "Content-Type": "application/json",
    },
  })
);

export const jobApi = attachAuthInterceptor(
  axios.create({
    baseURL: JOB_URL,
    headers: {
      "Content-Type": "application/json",
    },
  })
);

export const utilsApi = attachAuthInterceptor(
  axios.create({
    baseURL: UTILS_URL,
    headers: {
      "Content-Type": "application/json",
    },
  })
);

interface ErrorResponseData {
  message?: string;
  error?: string;
}

/**
 * Extracts error message from AxiosError response or generic error
 */
export function getErrorMessage(error: unknown, fallback = "An unexpected error occurred"): string {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ErrorResponseData>;
    if (axiosError.response?.data?.message) {
      return axiosError.response.data.message;
    }
    if (axiosError.response?.data?.error) {
      return axiosError.response.data.error;
    }
    if (axiosError.message) {
      return axiosError.message;
    }
  } else if (error instanceof Error) {
    return error.message;
  }
  return fallback;
}

export default {
  auth: authApi,
  user: userApi,
  job: jobApi,
  utils: utilsApi,
};
