# HireHeaven - Job Portal Microservices & Frontend

An intelligent job portal application built with a decoupled Node.js + Express + TypeScript microservices backend and a modern Next.js frontend.

---

## Architecture & Service Directory Structure

| Service Name | Directory | Port | Primary Responsibilities |
| :--- | :--- | :--- | :--- |
| **Auth Service** | [`services/auth`](file:///Users/anamikaverma/Desktop/coding/projects/jobPortal/services/auth) | `3000` | User registration, login, JWT token issuance, Redis reset token storage, Kafka password reset email dispatch. |
| **Utils Service** | [`services/utils`](file:///Users/anamikaverma/Desktop/coding/projects/jobPortal/services/utils) | `3001` | Cloudinary asset uploads, Google Gemini AI ATS resume evaluation, AI career advisor, Kafka mail consumer. |
| **User Service** | [`services/user`](file:///Users/anamikaverma/Desktop/coding/projects/jobPortal/services/user) | `3002` | User profiles, skill management, resume & profile photo updates, job application submissions. |
| **Job Service** | [`services/job`](file:///Users/anamikaverma/Desktop/coding/projects/jobPortal/services/job) | `3003` | Company directories, job postings, recruiter application review pipeline, Kafka status notifications. |
| **Frontend** | [`frontend`](file:///Users/anamikaverma/Desktop/coding/projects/jobPortal/frontend) | `3004` | Next.js App Router, Tailwind CSS, shadcn/ui, AuthContext, Protected Routes, Responsive UI. |

---

## Running the Backend

Follow these exact steps to start the complete backend suite in development mode.

> [!IMPORTANT]
> **Prerequisites: Kafka, Redis, and PostgreSQL must be running before executing `npm run dev`.**
> - **Kafka Broker**: Port `9092` (used by Auth and Job services for event streaming)
> - **Redis**: Port `6379` (used by Auth service for token caching)
> - **PostgreSQL**: Port `5432` (database used across microservices)

### Step 1: Verify Infrastructure Health
From the repository root, run the infrastructure check script:

```bash
npm run check-infra
```

This verifies that ports `9092` (Kafka), `6379` (Redis), and `5432` (PostgreSQL) are listening. If any service is unreachable, it will output a clear warning with recovery instructions.

### Step 2: Install All Service Dependencies
Install dependencies across all 4 microservices simultaneously:

```bash
npm run install:all
```

### Step 3: Build All Services
Compile TypeScript source code across all services:

```bash
npm run build:all
```

### Step 4: Start All 4 Services in Development
Run all 4 microservices concurrently with colored, tagged console outputs:

```bash
npm run dev
```

Alternatively, you can run the health check and start all services in a single step:

```bash
npm run dev:check
```

Each service will start in watch mode (`tsc -w` + `nodemon`) with dedicated color-coded prefixes:
- `[AUTH]` (Blue)
- `[UTILS]` (Magenta / Cyan)
- `[USER]` (Green)
- `[JOB]` (Yellow)

---

## Port Allocation & Conflict Advisory

Each microservice's `.env` was inspected:

| Service | `.env` Port Setting | Notes & Potential Conflicts |
| :--- | :--- | :--- |
| `services/auth` | `PORT=3000` | **Important:** Next.js also defaults to port `3000`. To prevent conflicts, the frontend dev server is configured to run on port `3004` (`npm run dev -p 3004`). |
| `services/utils` | `PORT=3001` | Referenced as `UPLOAD_SERVICE=http://localhost:3001` by `auth`, `user`, and `job`. |
| `services/user` | `PORT=3002` | Independent port. |
| `services/job` | `PORT=3003` | Independent port. |

> [!NOTE]
> - There are **no port collisions among the 4 backend microservices** (they occupy `3000`, `3001`, `3002`, `3003`).
> - On macOS, the built-in AirPlay Receiver frequently occupies port `5000`. Keeping the services on `3000–3003` avoids macOS AirPlay port conflicts.
> - In [`services/auth/.env`](file:///Users/anamikaverma/Desktop/coding/projects/jobPortal/services/auth/.env), `Frontend_Url=http://localhost:3000` is defined. Because the frontend runs on port `3004`, password reset links sent via email will point to `3000` unless updated to match your frontend port.

---

## How to Verify That All 4 Services Started Correctly

### 1. Terminal Startup Logs
When running `npm run dev`, verify that the following startup messages appear in your terminal:

```
[AUTH]  8. Starting Express
[AUTH]  Auth service is running on port 3000
[AUTH]  connected to redis
[UTILS] 1. Environment loaded
[UTILS] 2. PORT: 3001
[UTILS] 3. Consumer function called
[UTILS] Utils server is running on http://localhost:3001
[USER]  user services is running on port 3002
[JOB]   job services is running on port 3003
```

### 2. Check Listening Ports
In a new terminal window, run:

```bash
lsof -nP -iTCP:3000,3001,3002,3003 -sTCP:LISTEN
```

You should see 4 active Node processes listening on ports `3000`, `3001`, `3002`, and `3003`.

### 3. Test HTTP Endpoints
Test each service using `curl`:

```bash
# 1. Auth Service (Port 3000)
curl -i http://localhost:3000/api/auth/login

# 2. Utils Service (Port 3001)
curl -i http://localhost:3001/api/utils/upload

# 3. User Service (Port 3002)
curl -i http://localhost:3002/api/user/me

# 4. Job Service (Port 3003)
curl -i http://localhost:3003/api/job/all
```

Expected responses:
- Auth: `400 Bad Request` (`{"message":"Missing required fields"}`) — confirms Express and routes are running.
- Utils: `400 Bad Request` (`{"message":"Image buffer is required"}`) — confirms Cloudinary / upload router is running.
- User: `401 Unauthorized` (`{"message":"Unauthorized"}`) — confirms auth middleware is running.
- Job: `200 OK` (`[]` or array of active jobs) — confirms database query and job router are running.

---

## Running the Frontend

To start the Next.js frontend concurrently with your backend:

```bash
cd frontend
npm run dev
```

Visit **`http://localhost:3004`** in your browser.
