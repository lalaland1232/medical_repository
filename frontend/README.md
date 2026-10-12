# OsseoPlan — Medical Implant Case Management Frontend

A clinical-grade, high-reliability B2B web application designed for surgical teams and medical device specialists managing patient-specific reconstructive implant cases through a structured surgical-planning pipeline.

---

## Technical Stack & Architecture

- **Framework**: React 18 with TypeScript 5
- **Build Tooling & Dev Server**: Vite 5
- **Design System**: Tailored B2B Clinical CSS (in `src/index.css`) utilizing the Inter typography system, high-contrast accessible clinical status tokens, tabular data representations, and fluid dialogs.
- **Icons**: `lucide-react`
- **Zero Mock Policy**: 100% integrated with the live FastAPI backend (`/login`, `/sign_up`, `/admin_sign_up`, `/refresh_token`, `/create_case`, `/cases`, `/cases/{case_id}`).

---

## Getting Started

### 1. Prerequisites
- Node.js `v20.x` or higher
- Python `3.12+` with virtual environment installed at the root repository (`/home/noob/medical_record/.venv`)
- PostgreSQL running with `med_db` and `med_schema`

### 2. Start Backend
In the project root:
```bash
source .venv/bin/activate
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

### 3. Start Frontend
In the `frontend/` directory:
```bash
cd frontend
npm install
npm run dev
```
The application will be accessible at: `http://localhost:5173/`

### 4. Build for Production
```bash
cd frontend
npm run build
```
Generates production artifacts inside `frontend/dist/`.

---

## Environment Variables

| Variable | Default | Purpose |
| :--- | :--- | :--- |
| `VITE_API_BASE_URL` | `""` (Empty string) | Optional backend origin. When empty, requests route relatively via the Vite dev proxy (`vite.config.ts`) directly to `http://127.0.0.1:8000`, eliminating CORS requirements without modifying backend code. |

---

## Seed Accounts for Verification

| Role | Email | Password | Allowed Capabilities |
| :--- | :--- | :--- | :--- |
| **Superuser** (Role 4) | `john.doe@example.com` | `password123` | Read, Create, Update, Delete, Provision Admins |
| **Clinical Admin** (Role 5) | `shiv@gmail.com` | `password123` | Read, Create, Update, Delete cases |
| **Reviewer / User** (Role 6) | `user@example.com` | `string` | Read-only case access |
