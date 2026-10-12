# OsseoPlan — Medical Implant Case Management System

## Overview

**OsseoPlan** is a patient-specific surgical implant planning and case management platform tracking reconstructive implants through clinical drafting, planning, review, approval, and completion.

I architected and implemented the complete backend system using **Python, FastAPI, PostgreSQL, SQLAlchemy, Alembic, and JWT with Role-Based Access Control (RBAC)**. To demonstrate backend endpoints and provide reviewers with an interactive interface, I used AI assistance to generate the companion React + Vite frontend application. All backend services, database schemas, token rotation mechanics, session tracking, and REST endpoints are original backend implementations.

---

## 1. System Screenshots

### A. Login & Clinician Portal
Authentication interface with seed presets:
![Login Portal](docs/screenshots/01_login_portal.png)

### B. Dashboard & Clinical Pipeline Overview
Dashboard tracking metrics across surgical planning stages:
![Dashboard Overview](docs/screenshots/02_dashboard_overview.png)

### C. Cases Master Table & Server-Side Pagination
Data table rendering cases with priority and status badges, server-side pagination, and filtering:
![Cases Master Table](docs/screenshots/03_cases_master_table.png)

### D. Case Details & Surgical Specification Inspector
Modal view displaying patient reference, lead surgeon, implant type, authorizing clinician ID, and lifecycle dates:
![Case Details](docs/screenshots/04_case_detail_modal.png)

### E. Security & RBAC Audit View
Audit inspector showing active JWT claims, token lifetime, and backend permission matrix:
![Security and RBAC Audit](docs/screenshots/05_security_rbac_audit.png)

### F. Interactive FastAPI Swagger Documentation
API documentation generated at `/docs`:
![FastAPI Swagger Docs](docs/screenshots/06_fastapi_swagger_docs.png)

---

## 2. Technical Stack

- **Backend**: Python 3.12, FastAPI, PostgreSQL (`med_schema`), SQLAlchemy 2.0 ORM, Alembic migrations, PyJWT, Bcrypt, Uvicorn.
- **Frontend**: React 18, TypeScript, Vite 5, Lucide React, Custom B2B Clinical CSS.
- **Testing**: Pytest, FastAPI TestClient.

---

## 3. Seed Accounts for Reviewers

| Role | Email | Password | Permissions & Capabilities |
| :--- | :--- | :--- | :--- |
| **Clinical Admin** | `shiv@gmail.com` | `password123` | `read`, `create`, `update`, `delete` |
| **Superuser** | `john.doe@example.com` | `password123` | `read`, `create`, `update`, `delete`, `create_admin` |
| **Reviewer / Viewer** | `user@example.com` | `string` | `read` |

---

## 4. Setup Guide

### 1. Backend Setup
```bash
source .venv/bin/activate
cp .env.example .env
alembic upgrade head
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```
- Backend API: `http://127.0.0.1:8000`
- Swagger documentation: `http://127.0.0.1:8000/docs`

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
- Frontend application: `http://localhost:5173`

---

## 5. Running Automated Tests

```bash
.venv/bin/pytest tests/test_logout.py -v
```

Production frontend build:
```bash
cd frontend
npm run build
```

---

## 6. REST API Inventory

| Method | Endpoint | Description | Auth Required | Required Permission |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/login` | Authenticate user, issue access + refresh JWTs, record session. | Public | None |
| `POST` | `/logout` | Revoke active session in database and invalidate token. | Bearer Token | None |
| `POST` | `/refresh_token` | Rotate refresh token and issue a fresh JWT pair. | Bearer Refresh Token | None |
| `POST` | `/sign_up` | Self-register a standard Reviewer account (`role_id: 6`). | Public | None |
| `POST` | `/admin_sign_up` | Provision a new Clinical Administrator (`role_id: 5`). | Bearer Token | `create_admin` (Superuser only) |
| `GET` | `/cases` | Query cases with pagination (`?page=1`) and status/surgeon filters. | Public / Optional | None in route |
| `GET` | `/cases/{case_id}` | Retrieve single medical case by case identifier. | Public / Optional | None in route |
| `POST` | `/create_case` | Register new patient implant case record. | Bearer Token | `create` (Admin, Superuser) |
| `PATCH` | `/cases/{case_id}` | Update workflow phase (`Draft` $\rightarrow$ `Planning` $\rightarrow$ etc.). | Bearer Token | `update` (Admin, Superuser) |
| `DELETE` | `/cases/{case_id}` | Permanently delete case record from PostgreSQL. | Bearer Token | `delete` (Admin, Superuser) |

---

## 7. Documentation Index

- [Database Schema Specification (`docs/database.md`)](docs/database.md)
- [Requirements Traceability Matrix (`docs/traceability.md`)](docs/traceability.md)
- [Cloud Deployment Guide (`docs/deployment.md`)](docs/deployment.md)
- [Postman API Collection (`docs/postman_collection.json`)](docs/postman_collection.json)

---

## 8. Assumptions & Known Limitations

1. **Client-Side Priority Filter**: UI performs client-side priority filtering while using server-supported query parameters (`status`, `surgeon_name`, `patient_refrence`).
2. **Reverse Proxy Architecture**: Vite dev server proxies API calls to FastAPI; production deployment uses Nginx reverse proxy.
3. **De-identified Data**: Patient references use de-identified tracking codes (e.g., `PAT-CRAN-4011`).
