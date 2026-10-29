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

// Must match the Postgres enums created by services/job/src/index.ts
export const JOB_TYPES = ["Full-time", "Part-time", "Contract", "Internship"] as const;
export const WORK_LOCATIONS = ["on-site", "Remote", "Hybrid"] as const;
export const APPLICATION_STATUSES = ["Submitted", "Rejected", "Hired"] as const;

export type JobType = (typeof JOB_TYPES)[number];
export type WorkLocation = (typeof WORK_LOCATIONS)[number];

export interface Job {
  job_id: number;
  title: string;
  description: string;
  salary?: string | number | null;
  location: string;
  job_type?: JobType | null;
  openings?: string | number | null;
  role?: string | null;
  work_location?: WorkLocation | null;
  company_id: number;
  posted_by_recruiter_id?: number;
  is_active?: boolean;
  created_at?: string;
  company_name?: string;
  company_logo?: string | null;
}

export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number];

export interface Application {
  application_id: number;
  job_id: number;
  applicant_id: number;
  applicant_email?: string;
  resume?: string | null;
  status: ApplicationStatus;
  applied_at?: string;
  job_title?: string;
  job_salary?: string | number | null;
  job_location?: string;
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

// POST /api/utils/career
export interface CareerAdvice {
  summary: string;
  jobOptions: { title: string; responsibilities: string; why: string }[];
  skillsToLearn: {
    category: string;
    skills: { title: string; why: string; how: string }[];
  }[];
  learningApproach: { title: string; points: string[] };
}

// POST /api/utils/resume-analyser
export interface ScoreDetail {
  score: number;
  feedback: string;
}

export interface ResumeAnalysis {
  atsScore: number;
  scoreBreakdown: {
    formatting: ScoreDetail;
    keywords: ScoreDetail;
    structure: ScoreDetail;
    readability: ScoreDetail;
  };
  suggestions: {
    category: string;
    issue: string;
    recommendation: string;
    priority: "high" | "medium" | "low";
  }[];
  strengths: string[];
  summary: string;
}

// A recruiter's job, flattened from GET /api/job/company/:id with its company attached
export interface RecruiterJob extends Job {
  company_name: string;
  company_logo?: string | null;
}

// A recruiter-side application from GET /api/job/applications/:jobId, joined client-side with its job
export interface RecruiterApplication extends Application {
  applicant_email: string;
  job_title: string;
  company_id: number;
  company_name: string;
}
