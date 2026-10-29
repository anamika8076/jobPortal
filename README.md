# Hirely

Hirely is a job portal with two kinds of accounts:

- **Job seekers** search open roles, apply with a saved resume, track their applications, and use AI tools to check their resume and explore career paths.
- **Recruiters** create company pages, post jobs, review applicants, mark them hired or rejected (candidates are emailed automatically), and see hiring reports.

The backend is four Node.js/Express microservices sharing one PostgreSQL (Neon) database. The frontend is a Next.js app.

For a log of recent changes, see [docs/WORK_LOG.md](docs/WORK_LOG.md).

---

## Contents

- [Architecture](#architecture)
- [Tech stack](#tech-stack)
- [Project structure](#project-structure)
- [Getting started](#getting-started)
- [Environment variables](#environment-variables)
- [Features and pages](#features-and-pages)
- [API reference](#api-reference)
- [Data model](#data-model)
- [How the pieces work together](#how-the-pieces-work-together)
- [Known limitations](#known-limitations)

---

## Architecture

```
Browser
  │
  ▼
Next.js frontend (:3004)
  │  /api/* requests are proxied by next.config.mjs rewrites
  ├── /api/auth/*  ──►  auth service   (:3000)  register, login, password reset
  ├── /api/user/*  ──►  user service   (:3002)  profiles, skills, applying
  ├── /api/job/*   ──►  job service    (:3003)  companies, jobs, applicant management
  └── /api/utils/* ──►  utils service  (:3001)  file uploads, AI, email sending

auth, user, job ──► PostgreSQL (Neon)      one shared database
auth            ──► Redis (Upstash)        password-reset tokens (15 min)
auth, job       ──► Kafka "send-mail" ──► utils consumer ──► Gmail SMTP
auth, user, job ──► utils /upload ──► Cloudinary (resumes, photos, logos)
utils           ──► Google Gemini          resume analysis, career advice
```

Each service validates the JWT itself, using the same `JWT_SEC`. The browser never talks to Cloudinary, Gemini or the database directly.

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS, lucide-react, react-hot-toast, axios |
| Services | Node.js, Express 5, TypeScript |
| Database | PostgreSQL on Neon (`@neondatabase/serverless`) |
| Cache | Redis (Upstash) |
| Messaging | Kafka (`kafkajs`) |
| Files | Cloudinary |
| Email | Nodemailer over Gmail SMTP |
| AI | Google Gemini (`@google/genai`) |

## Project structure

```
jobPortal/
├── package.json            root scripts that run all services together
├── scripts/check-infra.js  checks that Kafka / Redis are reachable
├── services/
│   ├── auth/               register, login, forgot/reset password
│   ├── user/               profile, photo, resume, skills, applications (job seeker side)
│   ├── job/                companies, jobs, applicants (recruiter side)
│   └── utils/              Cloudinary upload, Gemini AI routes, Kafka email consumer
└── frontend/
    └── src/
        ├── app/                  pages (Next.js App Router)
        │   ├── page.tsx          home (job seeker home or employer home, by role)
        │   ├── jobs/             public job board and job detail
        │   ├── account/          job seeker area
        │   └── dashboard/        recruiter area
        ├── components/
        │   ├── shell/            shared sidebar, top bar, settings, cards and charts for both areas
        │   ├── recruiter/        recruiter navigation and widgets
        │   ├── seeker/           job seeker navigation, resume check, career advisor
        │   └── ui/               buttons, inputs, cards, badges
        ├── context/              AuthContext (session), RecruiterDataContext (recruiter data)
        ├── lib/                  API client, formatting and stats helpers
        └── types/                shared TypeScript types matching the database
```

Each service follows the same layout: `src/index.ts` (startup and table creation), `src/routes/`, `src/controllers/`, `src/middleware/` (JWT auth, multer) and `src/utils/`.

## Getting started

### Prerequisites

- Node.js 20 or newer (developed on Node 24) and npm
- Kafka running on `localhost:9092`. On macOS: `brew install kafka && brew services start kafka`
- Accounts and credentials for Neon (PostgreSQL), Upstash (Redis), Cloudinary, Google AI Studio (Gemini) and a Gmail app password

### Install

```bash
npm install                      # root tools (concurrently)
npm run install:all              # the four services
npm --prefix frontend install    # the frontend
```

### Configure

Copy each `.env.example` to `.env` (for the frontend, `.env.local`) and fill in the values. See [Environment variables](#environment-variables).

```bash
cp services/auth/.env.example  services/auth/.env
cp services/user/.env.example  services/user/.env
cp services/job/.env.example   services/job/.env
cp services/utils/.env.example services/utils/.env
```

### Run

Use two terminals:

```bash
# Terminal 1: all four backend services
npm run dev

# Terminal 2: the frontend
npm run frontend
```

Open http://localhost:3004.

On first start, auth and job create their database tables automatically. `npm run check-infra` checks that Kafka and Redis are reachable. It also checks for a local PostgreSQL, which you can ignore when using Neon.

> `npm run dev:all` starts everything in one terminal, but it stops all processes if any one fails, including when port 3004 is already in use.

## Environment variables

Never commit `.env` files; they are gitignored. Only the `.env.example` templates are tracked.

| Variable | Used by | Purpose |
|---|---|---|
| `PORT` | all services | 3000 auth, 3001 utils, 3002 user, 3003 job |
| `DB_URL` | auth, user, job | Neon connection string (same value in all three) |
| `JWT_SEC` | auth, user, job | JWT signing secret (**must be identical** in all three) |
| `UPLOAD_SERVICE` | auth, user, job | utils base URL, e.g. `http://localhost:3001` |
| `kafka_broker` | auth, job, utils | e.g. `localhost:9092` |
| `Redis_url` | auth | Redis URL for password-reset tokens |
| `Frontend_Url` | auth | Base URL for reset-password links, e.g. `http://localhost:3004` |
| `CLOUD_NAME`, `API_KEY`, `API_SECRET` | utils | Cloudinary credentials |
| `API_KEY_GEMINI` | utils | Gemini API key. Without it, uploads still work and AI routes return 503 |
| `GEMINI_MODELS` | utils | Optional. Comma-separated fallback order, default `gemini-3.8-flash,gemini-3.5-flash,gemini-3.7-flash` |
| `SMTP_USER`, `SMTP_PASS` | utils | Gmail address and Gmail App Password for outgoing email |
| `NEXT_PUBLIC_AUTH_URL`, `..._USER_URL`, `..._JOB_URL`, `..._UTILS_URL` | frontend | Optional; defaults match the ports above |

## Features and pages

### Public

| Route | Description |
|---|---|
| `/` | Job seekers and visitors: job search, latest openings, how it works. Recruiters: an employer home with how hiring works |
| `/jobs`, `/jobs/[id]` | Job board with title and location search, and job detail with Apply. Recruiters are sent to Manage Jobs |
| `/about` | About Hirely |
| `/login`, `/register`, `/forgot-password`, `/reset/[token]` | Authentication. Job seekers must upload a resume when registering |

### Job seeker account (`/account`, job seekers only)

| Route | Description |
|---|---|
| `/account` | Overview: application counts, recent applications, profile-strength checklist, open jobs mentioning your skills (keyword match) |
| `/account/jobs` | Search and browse jobs; apply from the job page |
| `/account/applications` | Applications table with status tabs: Under review, Hired, Not selected |
| `/account/profile` | Resume and skills, and a preview of what recruiters see |
| `/account/resume-check` | AI ATS check of your saved resume or an uploaded PDF |
| `/account/career` | AI career paths and skills to learn, based on your skills |
| `/account/settings` | Name, phone, bio, photo, password reset email, log out |

### Recruiter dashboard (`/dashboard`, recruiters only)

| Route | Description |
|---|---|
| `/dashboard` | Overview: counts, weekly applications chart, open jobs, recent applications |
| `/dashboard/company`, `/dashboard/company/[id]` | Create, view and delete companies |
| `/dashboard/post-job` | Post a job, with preview |
| `/dashboard/jobs`, `/dashboard/jobs/[id]` | Manage jobs (search, filter, paginate, close or reopen) and edit a job |
| `/dashboard/applicants`, `/dashboard/applicants/[id]` | All applicants with search and filters, candidate page with resume preview, Hire and Reject |
| `/dashboard/ai` | AI resume insights for a candidate |
| `/dashboard/analytics` | Applications over time, per job, status split, funnel, per-job performance |
| `/dashboard/settings` | Same settings as the job seeker account |

The old URLs `/profile`, `/applications` and `/ai` redirect to the matching page for the user's role.

## API reference

All routes go through the frontend at `/api/<service>/...`. "Auth" means the request needs an `Authorization: Bearer <token>` header; the frontend adds it automatically from the `token` cookie. Errors return `{ "message": "..." }`.

### Auth service, `/api/auth`

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/register` | – | Multipart: `name, email, password, phoneNumber, role` (`jobseeker`/`recruiter`), optional `bio`; job seekers must send `file` (resume). Returns `token` |
| POST | `/login` | – | `{ email, password }`. Returns `token` and `userObject` |
| POST | `/forgot` | – | `{ email }`. Emails a reset link valid for 15 minutes |
| POST | `/reset/:token` | – | `{ password }` |

### User service, `/api/user`

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/me` | ✓ | Current user with skills |
| GET | `/:userId` | ✓ | Another user's public profile |
| PUT | `/update/profile` | ✓ | `{ name, phoneNumber, bio }` |
| PUT | `/update/pic` | ✓ | Multipart `file`. Replaces the photo and deletes the old one |
| PUT | `/update/resume` | ✓ | Multipart `file` (PDF). The old file is kept because past applications link to it |
| POST | `/skill/add` | ✓ | `{ skillName }` |
| DELETE | `/skill/delete` | ✓ | `{ skillName }` |
| POST | `/apply/job` | ✓ job seeker | `{ job_id }`. Requires a resume on the profile |
| GET | `/application/all` | ✓ | My applications with job title, salary and location |

### Job service, `/api/job`

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/all` | – | Active jobs with company name and logo. Query: `title`, `location` |
| GET | `/:jobId` | – | One job |
| POST | `/company/create` | ✓ recruiter | Multipart: `name, description, website, file` (logo) |
| GET | `/company/all` | ✓ | My companies |
| GET | `/company/:id` | ✓ | Company with all its jobs |
| DELETE | `/company/delete/:companyId` | ✓ owner | Deletes the company, its jobs and their applications |
| POST | `/create` | ✓ recruiter | `title, description, salary, location, job_type, openings, role, work_location, company_id` |
| PUT | `/update/:jobId` | ✓ owner | Any subset of the create fields plus `is_active`; omitted fields are unchanged |
| GET | `/applications/:jobId` | ✓ owner | Applications for one job |
| PUT | `/application/update/:id` | ✓ owner | `{ status }`: `Submitted`, `Rejected` or `Hired`. Emails the candidate |

### Utils service, `/api/utils`

| Method | Path | Description |
|---|---|---|
| POST | `/upload` | `{ buffer, public_id? }`. Data URI upload to Cloudinary; deletes `public_id` first if given. Called by the other services |
| POST | `/career` | `{ skills }`. AI career suggestions as JSON |
| POST | `/resume-analyser` | `{ pdfBase64 }`. AI ATS score, breakdown, strengths and suggestions |

AI routes retry, fall back through `GEMINI_MODELS`, and return `503` with a friendly message when Gemini is busy.

## Data model

Tables are created at service startup with `CREATE TABLE IF NOT EXISTS`. There are no migration files.

```
users          (user_id, name, email UNIQUE, password, phone_number, role user_role,
                bio, resume, resume_public_id, profile_pic, profile_pic_public_id,
                created_at, subscription)
skills         (skill_id, name UNIQUE)
user_skills    (user_id → users, skill_id → skills)

companies      (company_id, name, description, website, logo, logo_public_id, recruiter_id, created_at)
jobs           (job_id, title, description, salary NUMERIC(10,2), location, job_type, openings NUMERIC(3,1),
                role, work_location, company_id → companies, posted_by_recruiter_id, created_at, is_active)
applications   (application_id, job_id → jobs, applicant_id, applicant_email, status, resume,
                applied_at, subscribed, UNIQUE(job_id, applicant_id))
```

Enums:

- `user_role`: `jobseeker`, `recruiter`
- `job_type`: `Full-time`, `Part-time`, `Contract`, `Internship`
- `work_location`: `on-site`, `Remote`, `Hybrid`
- `application_status`: `Submitted`, `Rejected`, `Hired`

## How the pieces work together

**Sessions.** Login returns a JWT valid for 15 days, stored in a `token` cookie. The frontend sends it as a Bearer header; on any `401` it clears the cookie and redirects to login. Next.js middleware blocks `/account` and `/dashboard` without a cookie, and each area also checks the user's role.

**Uploads.** Services convert the uploaded file to a data URI and post it to utils `/upload`, which stores it on Cloudinary and returns `url` and `public_id`.

**Email.** auth (password reset) and job (status change) publish `{ to, subject, html }` to the Kafka topic `send-mail`. The utils consumer sends it through Gmail SMTP as "Hirely".

**Recruiter data.** There is no single dashboard endpoint, so `RecruiterDataContext` loads companies, then each company's jobs, then each job's applications, and every dashboard page reads from it.

## Known limitations

- The utils routes (`/upload`, `/career`, `/resume-analyser`) have no authentication.
- There is no refresh token; a session lasts 15 days and then requires a new login.
- Application statuses are only Submitted, Rejected and Hired: no shortlist or interview stages, and no status history.
- Companies can't be edited after creation (no update endpoint).
- Pagination is client-side; `/api/job/all` returns every active job.
- Applying twice to the same job returns a generic error instead of "already applied" (the user service checks the wrong Postgres error code).
- Gmail SMTP suits development only; production should use a transactional email provider.
- There are no automated tests.
