export type UserRole = "jobseeker" | "recruiter";

export interface User {
  user_id: number;
  name: string;
  email: string;
  phone_number: string;
  role: UserRole;
  bio?: string | null;
  resume?: string | null;
  resume_public_id?: string | null;
  profile_pic?: string | null;
  profile_pic_public_id?: string | null;
  subscription?: string | null;
  skills: string[];
  created_at?: string;
}

export interface Company {
  company_id: number;
  name: string;
  description: string;
  website: string;
  logo?: string | null;
  logo_public_id?: string | null;
  recruiter_id: number;
  created_at?: string;
  jobs?: Job[];
}

export type JobType = "Full-time" | "Part-time" | "Contract" | "Internship" | "Freelance" | string;
export type WorkLocation = "Remote" | "On-site" | "Hybrid" | string;

export interface Job {
  job_id: number;
  title: string;
  description: string;
  salary?: string | number | null;
  location: string;
  job_type?: JobType | null;
  openings?: number | null;
  role?: string | null;
  work_location?: WorkLocation | null;
  company_id: number;
  posted_by_recruiter_id?: number;
  is_active?: boolean;
  created_at?: string;
  company_name?: string;
  company_logo?: string;
}

export type ApplicationStatus = "pending" | "reviewed" | "accepted" | "rejected";

export interface Application {
  application_id: number;
  job_id: number;
  applicant_id: number;
  applicant_email?: string;
  resume?: string | null;
  status: ApplicationStatus;
  applied_at?: string;
  job_title?: string;
}

export interface AuthResponse {
  message: string;
  token: string;
  registeredUser?: User;
  userObject?: User;
}

export interface ApiResponse<T = unknown> {
  message?: string;
  data?: T;
  [key: string]: unknown;
}
