# Work log

What was built and fixed during the development sessions of 28–29 October 2026. See the [README](../README.md) for how the project works today.

## 1. Security and setup

- **Stopped tracking secrets.** `services/auth/.env` and `services/utils/.env.broken` were committed to a public repository, containing the database URL, JWT secret and Redis credentials. They are no longer tracked, and `services/auth/dist` (build output) was removed from git as well. The old values remain in git history, so **those credentials must be rotated**.
- **Added `.env.example` templates** for every service and the frontend, with variable names only.
- **Local environment:** created the missing `.env` files for user, job and utils, and pointed `Frontend_Url` at the frontend (port 3004) so password-reset links work.
- **The utils service no longer crashes without a Gemini key.** Uploads keep working, and the AI routes return a clear 503 until the key is set.

## 2. Backend fixes

| Service | Fix |
|---|---|
| job | `PUT /update/:jobId` updates only the fields sent. Previously, omitted fields were overwritten with null, so closing a job could wipe it |
| job | Moving a job to another company now checks that the recruiter owns that company |
| job | Application status is validated (`Submitted`, `Rejected`, `Hired`): bad values get a 400 instead of a 500 |
| job | Removed leftover debug logging of request bodies |
| user | The auth middleware now loads `profile_pic_public_id`, so replacing a photo deletes the old one from Cloudinary |
| user | Replacing a resume **keeps** the old file, because past applications still link to it |
| utils | Gemini calls fall back between models, time out after 20 s per model and 50 s overall, and return a friendly error instead of Google's raw message |
| utils | Fixed the PDF data-URI prefix check in the resume analyser |
| frontend | Raised the Next.js proxy timeout to 2 minutes for slower AI responses |

## 3. Design system

- **One professional theme across the whole app:** a single indigo accent (`#4f46b8` light, `#8b83f0` dark), neutral grays, and no gradients, glows or sparkle icons. Chart colours were checked for contrast in both modes.
- **Rebranded to Hirely,** with a new logo: a lowercase "h" whose right leg carries a dot, reading as "hi". Used in the navbar, footer, sidebars, auth pages and browser tab, plus the email templates and sender name.
- Shared `AppShell` (sidebar plus top bar) used by both signed-in areas. The top bar has breadcrumbs, search with a `⌘K` shortcut, Home, an optional main action and the theme toggle. Account, settings and logout live at the bottom of the sidebar.
- Dates display as `29 Oct 2026` throughout.

## 4. Public site

- **Home:**
  - For job seekers and visitors: a working job search (the old one was read-only), popular searches, live "Latest openings" from the API, and plain copy describing only features that exist.
  - For recruiters: a general employer home, the same for every recruiter, with no personal data.
- **Jobs:** removed the fake sample jobs shown when the API failed; added real loading, empty and error states, pagination, and `?search=` / `?location=` support.
- **Job detail:** apply flow with "Applied" state, a prompt to add a resume if missing, and company details.
- **About:** rewritten as a real About page instead of a microservices diagram, which also listed the wrong ports.
- **Navbar:** signed-in users see Home · Dashboard · About; visitors see Home · Jobs · About. The footer is role-aware too.

## 5. Recruiter dashboard (`/dashboard`)

New: overview, company profile, post a job (with preview), manage jobs table, applicants with search and filters, candidate page with resume preview, AI resume insights, analytics, and settings. All data comes from existing endpoints, and status changes only update the UI after the backend confirms.

Features without a backend API were left out on purpose: interviews, shortlisting, company editing, deadlines, drafts and notifications.

## 6. Job seeker account (`/account`)

New: overview (stats, profile strength, recent applications, jobs mentioning your skills), find jobs, a My Applications table with status tabs, Resume & Skills, Resume Check (using the saved resume or an upload), Career Advisor, and settings.

The old `/profile`, `/applications` and `/ai` pages now redirect to the right page for each role.

## 7. Verification

Every change was type-checked (`tsc --noEmit`) for the frontend and the affected services, and the frontend production build (`next build`) passed. Routes were smoke-tested against the running dev servers. There are no automated tests in the project yet.

## Open follow-ups

- Rotate the database, JWT and Redis credentials that were exposed in git history.
- Add authentication to the utils routes.
- Fix the duplicate-apply error code (`2305` should be `23505`) in `services/user/src/controllers/user.ts`.
- Add an `SMTP_HOST`/`SMTP_PORT`/`SMTP_FROM` setting so production can use a transactional email provider.
- Consider a backend endpoint for recruiter dashboard data, server-side pagination for `/api/job/all`, and automated tests.
