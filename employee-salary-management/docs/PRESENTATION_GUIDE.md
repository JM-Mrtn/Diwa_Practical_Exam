# Simple presentation / demo script

## Introduce the technology

- **React + TypeScript** builds the pages and helps catch type mistakes while coding.
- **Tailwind CSS** provides ready-made styling classes.
- **NestJS** receives API requests and organizes backend code into modules.
- **PostgreSQL** permanently stores the records.
- **Swagger** lets the examiner try every API at `/docs`.

## Explain the folders

- `frontend/src/pages/` — one page for each exam task.
- `frontend/src/components/` — reusable UI (employee dropdown, alerts, formatted pesos).
- `frontend/src/api.ts` — all the `fetch()` API calls.
- `backend/src/employees/` — Task 1, employee onboarding.
- `backend/src/salaries/` — Task 2, basic salary assignment.
- `backend/src/salary-components/` — Task 3, reusable components and employee-specific amounts.
- `backend/src/salary-rates/` — Task 4, salary computations.
- `backend/src/app.module.ts` — connects the four modules and PostgreSQL.
- `docs/ERD.md` — database relationships.

## What are module, controller, service and entity?

- **Module:** groups related backend files and dependencies.
- **Controller:** receives HTTP requests such as `POST /api/employees`.
- **Service:** runs the business rules and checks duplicates.
- **Entity:** maps a TypeScript class to a PostgreSQL database table.
- **DTO:** checks the shape of the user's input.

## Live demo steps

1. Open **Employee Onboarding** and add `EMP-001 / Ana / M. / Reyes / today's date`.
2. Attempt `EMP-001` again — the system rejects duplicates.
3. Edit Ana's name; verify the employee list updates.
4. Open **Salary Assignment**, select Ana and enter `25000`.
5. Open **Salary Components**, create `Transportation Allowance` and `Rice Allowance`.
6. Assign those components to Ana, for example `1500` and `1000`.
7. Try assigning Transportation Allowance twice to Ana — see duplicate validation.
8. Open **Salary Computation**. Total monthly = `25000 + 1500 + 1000 = 27500`.
9. Annual = `27500 × 12 = 330000`; daily = `330000 ÷ 314`; hourly = daily ÷ 8; minute = hourly ÷ 60.
10. Update basic salary to `30000`, return to computation, and verify it updates.
11. Remove one assigned component and recompute; the database row remains with `deleted_at` set.
12. Open `http://localhost:3000/docs` to explain Swagger.

## How data travels

`React form → fetch in api.ts → NestJS controller → NestJS service → TypeORM entity → PostgreSQL`.

A response then travels back to React, which refreshes the display.

## Important boundaries

- This is a **local classroom system**, not production payroll. There is no authentication, tax logic, deductions, employee deletion, or payroll history requirement in the task.
- `DB_SYNCHRONIZE=true` is convenient for a clean local database only. Do not enable it for an existing production database.
