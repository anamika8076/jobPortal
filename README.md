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
- [Deploy on Render](docs/DEPLOY_RENDER.md)
- [Environment variables](#environment-variables)
- [Deploying on AWS](#deploying-on-aws)
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
| `JWT_SEC` | auth, user, job, utils | JWT signing secret (**must be identical** in all four) |
| `INTERNAL_API_KEY` | auth, user, job, utils | Secret that lets services call the utils upload route (**must be identical** in all four) |
| `UPLOAD_SERVICE` | auth, user, job | utils base URL, e.g. `http://localhost:3001` |
| `kafka_broker` | auth, job, utils | e.g. `localhost:9092` |
| `Redis_url` | auth | Redis URL for password-reset tokens |
| `Frontend_Url` | auth | Base URL for reset-password links, e.g. `http://localhost:3004` |
| `CLOUD_NAME`, `API_KEY`, `API_SECRET` | utils | Cloudinary credentials |
| `API_KEY_GEMINI` | utils | Gemini API key. Without it, uploads still work and AI routes return 503 |
| `GEMINI_MODELS` | utils | Optional. Comma-separated fallback order, default `gemini-3.5-flash-lite,gemini-flash-lite-latest,gemini-3.6-flash,gemini-3.5-flash,gemini-3.8-flash` |
| `SMTP_USER`, `SMTP_PASS` | utils | Gmail address and Gmail App Password for outgoing email |
| `NEXT_PUBLIC_AUTH_URL`, `..._USER_URL`, `..._JOB_URL`, `..._UTILS_URL` | frontend | Optional; defaults match the ports above |

## Deploying on AWS

This runs the whole app on one EC2 server: the four services, the frontend, Kafka and an HTTPS proxy. Neon, Redis, Cloudinary, Gemini and Gmail stay external. The server only runs on the AWS Free plan's credit, so it isn't billed as long as the account stays on that plan.

Replace `YOUR_IP` with your Elastic IP. `YOUR-IP-WITH-DASHES.sslip.io` is a free hostname that points at that IP, such as `13-233-1-2.sslip.io` for `13.233.1.2`.

```
Internet ──► Caddy (:80, :443, HTTPS) ──► Next.js (:3004) ──► services (:3000-3003)
                                                               └─► Kafka (localhost:9092)
```

### Free plan limits

As of November 2026:

- The Free plan doesn't charge you unless you upgrade. It ends after 6 months or when the credit runs out, whichever comes first. AWS then suspends the account and deletes it after 90 days unless you upgrade.
- A Free plan project can be locked to one region. Other regions ask you to upgrade, so use the assigned region rather than upgrading.
- Don't choose **Upgrade plan** or **Activate advanced features**, and avoid NAT Gateways and Load Balancers.
- Check your remaining credit in **Cost Explorer**. Keep backups of anything stored only on the server, because a suspended account loses access to it.

### 1. Create the server

In **EC2 → Launch instance**:

| Setting | Value |
|---|---|
| OS | Ubuntu 24.04 |
| Type | `t3.small` (`t3.micro` has too little memory) |
| Key pair | Create one and keep the `.pem` file private |
| Storage | 20 GiB `gp3` (the default 8 GiB is too small) |
| Inbound rules | HTTP and HTTPS from anywhere. Never open ports 3000-3004 or 9092 |

Then go to **Elastic IPs → Allocate**, and use **Actions → Associate** to attach it, so the address survives a stop and start. Release it if you delete the server.

### 2. Connect

Use **EC2 Instance Connect**, a browser terminal that keeps working when your own IP changes:

1. In the security group, add an inbound **SSH** rule whose source is the prefix list `com.amazonaws.<region>.ec2-instance-connect`. Choose the entry without `ipv6`.
2. Go to **Instances → your server → Connect → EC2 Instance Connect**, with username `ubuntu`.

To use `ssh` from a laptop as well, add an SSH rule for your own IP. It stops working whenever your network changes.

### 3. Install

```bash
sudo fallocate -l 2G /swapfile && sudo chmod 600 /swapfile
sudo mkswap /swapfile && sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab

curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
source ~/.bashrc
nvm install 20
npm install -g pm2

git clone https://github.com/anamika8076/jobPortal.git
cd jobPortal && npm install
```

### 4. Add settings

Create `.env` in each of `services/auth`, `user`, `job` and `utils`, from the `.env.example` files or by copying them with `scp`. Never commit them. Then set the values that differ in production:

```bash
cd ~/jobPortal
K=$(openssl rand -hex 32)
for s in auth user job utils; do
  sed -i '/^INTERNAL_API_KEY=/d' services/$s/.env
  printf '\nINTERNAL_API_KEY=%s\n' "$K" >> services/$s/.env
done
unset K
sed -i '/^JWT_SEC=/d' services/utils/.env
printf 'JWT_SEC=%s\n' "$(grep '^JWT_SEC=' services/auth/.env | cut -d= -f2-)" >> services/utils/.env
sed -i 's#^Frontend_Url=.*#Frontend_Url=https://YOUR-IP-WITH-DASHES.sslip.io#' services/auth/.env
```

### 5. Install Kafka

This limits Kafka to 256 MB of memory and only accepts local connections. Its data moves out of the default `/tmp`, which is cleared on reboot.

```bash
sudo apt update && sudo apt install -y openjdk-17-jre-headless
cd ~ && curl -O https://archive.apache.org/dist/kafka/3.9.1/kafka_2.13-3.9.1.tgz
sudo tar -xzf kafka_2.13-3.9.1.tgz -C /opt && sudo mv /opt/kafka_2.13-3.9.1 /opt/kafka
rm kafka_2.13-3.9.1.tgz
sudo mkdir -p /var/lib/kafka && sudo chown -R ubuntu:ubuntu /opt/kafka /var/lib/kafka

C=/opt/kafka/config/kraft/server.properties
sed -i 's#^listeners=.*#listeners=PLAINTEXT://localhost:9092,CONTROLLER://localhost:9093#' $C
sed -i 's#^log.dirs=.*#log.dirs=/var/lib/kafka#' $C
sed -i 's#^log.retention.hours=.*#log.retention.hours=24#' $C
/opt/kafka/bin/kafka-storage.sh format -t "$(/opt/kafka/bin/kafka-storage.sh random-uuid)" -c $C

printf '%s\n' \
  '[Unit]' \
  'Description=Apache Kafka' \
  'After=network.target' \
  '' \
  '[Service]' \
  'User=ubuntu' \
  'Environment="KAFKA_HEAP_OPTS=-Xms256m -Xmx256m"' \
  'ExecStart=/opt/kafka/bin/kafka-server-start.sh /opt/kafka/config/kraft/server.properties' \
  'Restart=on-failure' \
  '' \
  '[Install]' \
  'WantedBy=multi-user.target' \
  | sudo tee /etc/systemd/system/kafka.service
sudo systemctl daemon-reload
sudo systemctl enable --now kafka
```

Confirm with `systemctl is-active kafka`, which should print `active`. Do this before starting the services, because they only try to connect to Kafka at startup.

### 6. Build and start

```bash
cd ~/jobPortal
for s in auth user job utils; do
  (cd services/$s && npm run build && pm2 start npm --name hirely-$s -- start)
done

cd frontend && npm install
nohup npm run build > ~/frontend-build.log 2>&1 &
```

The frontend build takes several minutes. It runs under `nohup` so a dropped connection doesn't kill it. Check `tail ~/frontend-build.log` until it finishes, and confirm `~/jobPortal/frontend/.next/BUILD_ID` exists. Then:

```bash
cd ~/jobPortal/frontend
pm2 start npm --name hirely-frontend -- start
pm2 save
pm2 startup
```

`pm2 startup` only **prints** a `sudo env PATH=...` command. Run that command, then `pm2 save` again, or the apps won't return after a reboot.

### 7. Turn on HTTPS

HTTPS is required, not optional: the login cookie is `secure` in production, so login fails over plain HTTP.

```bash
sudo apt install -y caddy
printf 'YOUR-IP-WITH-DASHES.sslip.io {\n  reverse_proxy localhost:3004\n}\n' | sudo tee /etc/caddy/Caddyfile
sudo systemctl restart caddy
```

Caddy gets and renews the certificate automatically.

### Using your own address

Point a name at `YOUR_IP` with a free [DuckDNS](https://www.duckdns.org) subdomain, or an A record on a domain you've bought. Buy it from a registrar other than Route 53 to keep the AWS account free of charges. Then:

```bash
D=your.domain
printf '%s {\n  reverse_proxy localhost:3004\n}\n' "$D" | sudo tee /etc/caddy/Caddyfile
sudo systemctl restart caddy
cd ~/jobPortal
sed -i "s#^Frontend_Url=.*#Frontend_Url=https://$D#" services/auth/.env
pm2 restart hirely-auth
```

Users have to log in again on a new address, because cookies belong to the domain.

### Deploying updates

```bash
cd ~/jobPortal && git pull
# Rebuild only what changed, for example:
(cd services/auth && npm run build) && pm2 restart hirely-auth
# Frontend changes:
cd frontend && npm install && nohup npm run build > ~/frontend-build.log 2>&1 &
# When that finishes: pm2 restart hirely-frontend
```

`.env` files are read at startup, so restart a service after editing its file. Add new variables to the server **before** restarting code that needs them.

### Checks

```bash
pm2 list                                    # all 5 should be online
systemctl is-active kafka caddy             # both should be active
pm2 logs hirely-utils --lines 30 --nostream # should include "Mail service consumer connected"
free -h
```

Then test login, a photo upload, registering a job seeker with a resume, Forgot Password (including the spam folder) and Resume Check. Without a login, `POST /api/utils/upload` and the AI routes should return `401`.

### Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| `ssh` times out, while port 80 answers | Your public IP changed, so the firewall blocks port 22 | Update the SSH rule, or use the browser terminal |
| Stuck at a `>` prompt after pasting | A `<<'EOF'` block was cut off by the paste, so later commands become text | Press `Ctrl + C`. Prefer `printf` blocks, as in this guide |
| A build looks frozen at "Linting and checking validity of types" | The connection dropped and killed the build | Run `ps aux \| grep next`. If nothing is running, rebuild with `nohup` |
| `Permission denied (publickey)` | Wrong key, or the key's permissions are too open | `chmod 400 your-key.pem`, and check you're using the right file |
| Mumbai or another region says "unavailable" | The Free plan project is assigned to one region | Stay in the assigned region. Don't upgrade |
| Login works locally but not on the server | Site opened over HTTP, so the `secure` cookie isn't saved | Open it over HTTPS |
| No emails, but Forgot Password says a link was sent | Kafka isn't running, or SMTP values are missing. The page shows success either way | Check `systemctl is-active kafka` and `SMTP_USER`/`SMTP_PASS`, then `pm2 restart hirely-auth hirely-job hirely-utils` |
| `ECONNREFUSED 127.0.0.1:9092` in logs | Kafka was down when the service started | Check the log's timestamp first, because old errors stay in the log. Start Kafka and restart the services |
| Uploads return `401` | `INTERNAL_API_KEY` is missing or differs between services | Set the same value in all four `.env` files and restart |
| AI routes return `401` for a logged-in user | `JWT_SEC` in utils differs from auth | Copy the value from auth and restart utils |
| AI routes return `503` | Every Gemini model is busy, or the quota is used up | Retry shortly. Reorder `GEMINI_MODELS` or use a paid key if it keeps happening |
| HTTPS certificate error on a new domain | The name doesn't point at the server yet | Wait, then run `sudo systemctl restart caddy` |

### Deployment lessons

- **Measure before blaming.** Timeouts on different ports told us firewall from app, and timestamps told us old log errors from new ones. "Connection refused" means the server is reachable with nothing listening; "timed out" usually means a firewall.
- **Long jobs shouldn't depend on your connection.** Use `nohup` on anything slow, especially on mobile or unstable networks.
- **Check every service's dependencies on startup.** Services that connect to Kafka once at startup need a restart after Kafka comes up.
- **Handle connection errors.** A Redis client with no `error` listener crashed the auth service whenever the connection dropped.
- **Give small servers limits.** Swap and a capped Kafka heap let everything fit in 2 GB.
- **Expose as little as possible.** Only 80 and 443 need to be public. Remember that the Next.js proxy makes every `/api/*` route public, so each route needs its own protection.
- **Secrets stay out of git, and leaked ones must be rotated.** Removing a committed `.env` doesn't remove it from history.

For a Render deployment instead, see [docs/DEPLOY_RENDER.md](docs/DEPLOY_RENDER.md).

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
| POST | `/upload` | Requires the `x-internal-key` header. `{ buffer, public_id? }`. Data URI upload to Cloudinary; deletes `public_id` first if given. Called by the other services |
| POST | `/career` | Requires login. `{ skills }`. AI career suggestions as JSON |
| POST | `/resume-analyser` | Requires login. `{ pdfBase64 }`. AI ATS score, breakdown, strengths and suggestions |

AI routes try each model in `GEMINI_MODELS`, then make a second pass (100 s budget). Empty or malformed AI output counts as a failed attempt. If every model fails they return `503` with a friendly message.

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

- There is no refresh token; a session lasts 15 days and then requires a new login.
- Application statuses are only Submitted, Rejected and Hired: no shortlist or interview stages, and no status history.
- Companies can't be edited after creation (no update endpoint).
- Pagination is client-side; `/api/job/all` returns every active job.
- Applying twice to the same job returns a generic error instead of "already applied" (the user service checks the wrong Postgres error code).
- Gmail SMTP suits development only; production should use a transactional email provider.
- Forgot Password reports success even if the email can't be queued, for example when Kafka is down.
- There is no rate limiting, so any logged-in user can make unlimited AI requests against the Gemini quota.
- There are no automated tests.
