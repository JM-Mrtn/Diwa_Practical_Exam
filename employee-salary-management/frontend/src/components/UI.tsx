import type { ReactNode } from "react";
import type { Employee } from "../types";

export const peso = (value: number | string) =>
  new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(value));
export const fullName = (e: Employee) =>
  [e.firstName, e.middleName, e.lastName].filter(Boolean).join(" ");
export function PanelTitle({
  title,
  subtitle,
  right,
}: {
  title: string;
  subtitle?: string;
  right?: ReactNode;
}) {
  return (
    <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
      <div>
        <h2 className="heading">{title}</h2>
        {subtitle && <p className="subheading">{subtitle}</p>}
      </div>
      {right}
    </div>
  );
}
export function EmployeeSelect({
  employees,
  value,
  onChange,
}: {
  employees: Employee[];
  value: number | null;
  onChange: (value: number | null) => void;
}) {
  return (
    <div>
      <label className="field-label" htmlFor="choose-employee">
        Select employee
      </label>
      <select
        id="choose-employee"
        className="field"
        value={value ?? ""}
        onChange={(e) =>
          onChange(e.target.value ? Number(e.target.value) : null)
        }
      >
        <option value="">Choose an employee...</option>
        {employees.map((e) => (
          <option key={e.id} value={e.id}>
            {e.employeeId} — {fullName(e)}
          </option>
        ))}
      </select>
    </div>
  );
}
export function Alert({
  message,
  kind = "error",
}: {
  message: string;
  kind?: "error" | "success";
}) {
  return (
    <div
      role="alert"
      className={`rounded-lg border px-4 py-3 text-sm ${kind === "error" ? "border-red-200 bg-red-50 text-red-800" : "border-emerald-200 bg-emerald-50 text-emerald-800"}`}
    >
      {message}
    </div>
  );
}
export function Empty({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-6 py-12 text-center text-sm text-slate-500">
      {children}
    </div>
  );
}
