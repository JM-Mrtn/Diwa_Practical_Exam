# Employee Onboarding and Salary Management System

A complete beginner-friendly **four-module** practical exam project built with **React + TypeScript + Tailwind CSS**, **NestJS + TypeScript**, **PostgreSQL**, **TypeORM**, and **Swagger**.

## Folder overview

```text
employee-salary-management/
├── backend/
│   ├── src/
│   │   ├── employees/             # Task 1: entity, DTO, controller, service, module
│   │   ├── salaries/              # Task 2: salary assignment
│   │   ├── salary-components/     # Task 3: catalog + employee component assignments
│   │   ├── salary-rates/          # Task 4: computed salary rates
│   │   ├── common/                # small shared money helpers
│   │   ├── app.module.ts          # joins all backend modules + database
│   │   └── main.ts                # starts API and Swagger
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── pages/                 # four easy-to-explain React pages
│   │   ├── components/            # reusable inputs, formatting and alerts
│   │   ├── api.ts                 # API request functions
│   │   ├── App.tsx                # navigation and shared employee state
│   │   └── types.ts               # TypeScript interfaces
│   └── package.json
├── docs/
│   ├── ERD.md
│   └── PRESENTATION_GUIDE.md
└── docker-compose.yml            # optional one-command local PostgreSQL
```

## Requirements

- Node.js **20 or newer** (Node 22 recommended)
- npm
- PostgreSQL 15+ installed locally **OR** Docker Desktop

## Setup (Windows / VS Code)

Open the project root in VS Code. Open **three terminals**.

### Terminal 1 — start PostgreSQL

**Option A (easy, Docker Desktop installed):**

```bash
docker compose up -d
```

Creates `employee_salary_db`, user `postgres`, password `postgres`, port `5432`.

**Option B (already installed PostgreSQL):**

In pgAdmin or psql, create a new empty database called `employee_salary_db`.
Use your actual PostgreSQL username and password in `backend/.env`.

### Terminal 2 — start the NestJS backend

```bash
cd backend
npm install
```

Copy `backend/.env.example` to `backend/.env` and update the credentials if necessary.
On Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

Then run:

```bash
npm run start:dev
```

The backend automatically creates its **four tables** on the first start in a blank local DB.

- REST API: http://localhost:3000/api
- Swagger docs: http://localhost:3000/docs

### Terminal 3 — start the React frontend

```bash
cd frontend
npm install
npm run dev
```

Open **http://localhost:5173** in your browser.

You do **not** need Live Server. Vite provides the frontend dev server.

## Features checked against the exam

| Exam task | Included behavior |
|---|---|
| 1. Employee onboarding | Add/edit, all required-field validation, unique Employee ID in PostgreSQL |
| 2. Salary assignment | Choose employee, assign/update monthly basic salary, view current amount, reject negatives |
| 3. Salary components | Create reusable names, rename, assign several employee-specific amounts, edit amounts, remove assignment, soft delete catalog, prevent active duplicates |
| 4. Salary rates | Selected employee, basic + active component breakdown, annual/daily/hourly/per-minute, auto-update after changes, PHP formatting, divisor 314 |
| Technical | React TypeScript, Tailwind CSS, NestJS API, PostgreSQL, Swagger, ERD |

## API routes

| Method | Path | Purpose |
|---|---|---|
| GET | `/api/employees` | List employees |
| POST | `/api/employees` | Create employee |
| GET | `/api/employees/:id` | Read employee |
| PATCH | `/api/employees/:id` | Update employee |
| GET | `/api/salaries/:employeeId` | Read employee's salary (or null) |
| PUT | `/api/salaries/:employeeId` | Create/update salary |
| GET | `/api/salary-components` | Read active component catalog |
| POST | `/api/salary-components` | Create component name |
| PATCH | `/api/salary-components/:id` | Rename component |
| DELETE | `/api/salary-components/:id` | Soft delete catalog component |
| GET | `/api/employees/:employeeId/components` | List assigned active components |
| POST | `/api/employees/:employeeId/components` | Assign catalog component to employee |
| PATCH | `/api/employees/:employeeId/components/:assignedId` | Update employee's component amount |
| DELETE | `/api/employees/:employeeId/components/:assignedId` | Soft delete employee assignment |
| GET | `/api/salary-rates/:employeeId` | Return salary rates + breakdown |

## ERD and presentation guide

Read `docs/ERD.md` for a Mermaid ERD with PKs, FKs and relationships. Read `docs/PRESENTATION_GUIDE.md` for an easy live demo and explanations.

## Calculation example

If monthly basic = ₱25,000, and active monthly components total ₱2,500:

- Total monthly = ₱27,500
- Annual = ₱27,500 × 12 = ₱330,000
- Daily = ₱330,000 ÷ 314 = ₱1,050.96 (rounded for display)
- Hourly = (₱330,000 ÷ 314) ÷ 8 = ₱131.37
- Per minute = (₱330,000 ÷ 314 ÷ 8) ÷ 60 = ₱2.19

**Interpretation:** All active components are **monthly additions** because the exam does not define deductions, component types, or calculation frequencies.

## Important local-dev notes

- `DB_SYNCHRONIZE=true` creates/updates tables automatically for a **fresh classroom database**. In production, use database migrations instead.
- This project intentionally omits authentication and payroll tax/deduction logic because they are not part of the examination.
- `DELETE` for salary components is a soft delete (`deleted_at` timestamp), not permanent SQL deletion.
- A catalog soft delete hides that component from *every* employee's active salary calculation. Their assignment history remains in PostgreSQL.
- All validation is performed in the frontend **and** the backend; uniqueness is also backed by database constraints/indexes.
- Use `npm run build` inside `backend` and `frontend` to verify TypeScript compilation.
