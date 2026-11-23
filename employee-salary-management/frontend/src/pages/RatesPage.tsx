import { useEffect, useState } from "react";
import { Calculator, RefreshCw } from "lucide-react";
import { api } from "../api";
import {
  Alert,
  EmployeeSelect,
  Empty,
  PanelTitle,
  peso,
} from "../components/UI";
import type { Employee, SalaryBreakdown } from "../types";

export function RatesPage({
  employees,
  selected,
  onSelect,
  revision,
}: {
  employees: Employee[];
  selected: number | null;
  onSelect: (v: number | null) => void;
  revision: number;
}) {
  const [data, setData] = useState<SalaryBreakdown | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    let active = true;
    setError("");
    setData(null);
    if (selected === null) return;
    setLoading(true);
    api.rates
      .compute(selected)
      .then((v) => {
        if (active) setData(v);
      })
      .catch((e) => {
        if (active) setError((e as Error).message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [selected, revision]);
  return (
    <div className="space-y-5">
      <section className="panel">
        <PanelTitle
          title="Salary rate computation"
          subtitle="Automatic rates use the current monthly basic salary plus active monthly components."
        />
        <EmployeeSelect
          employees={employees}
          value={selected}
          onChange={onSelect}
        />
        {selected === null ? (
          <div className="mt-5">
            <Empty>
              <Calculator className="mx-auto mb-2" />
              Choose an employee to compute salary rates.
            </Empty>
          </div>
        ) : loading ? (
          <p className="py-10 text-center text-sm text-slate-500">
            <RefreshCw className="mx-auto mb-2 animate-spin" />
            Computing salary rates...
          </p>
        ) : error ? (
          <div className="mt-5">
            <Alert message={error} />
          </div>
        ) : (
          data && (
            <div className="mt-5">
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {(
                  [
                    ["Annual salary", data.rates.annualSalary],
                    ["Daily rate", data.rates.dailyRate],
                    ["Hourly rate", data.rates.hourlyRate],
                    ["Per-minute rate", data.rates.perMinuteRate],
                  ] as const
                ).map(([label, value]) => (
                  <div
                    key={label}
                    className="rounded-xl border border-blue-100 bg-blue-50 p-4"
                  >
                    <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
                      {label}
                    </p>
                    <p className="mt-2 text-xl font-extrabold text-blue-950">
                      {peso(value)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )
        )}
      </section>
      {data && (
        <>
          <section className="panel">
            <PanelTitle
              title="Monthly salary breakdown"
              subtitle={`Employee: ${data.employee.fullName} (${data.employee.employeeId})`}
            />
            <div className="space-y-3 text-sm">
              <div className="flex justify-between gap-3 border-b border-slate-100 pb-3">
                <span>Basic salary</span>
                <strong>{peso(data.monthlyBasicSalary)}</strong>
              </div>
              {data.components.map((c) => (
                <div
                  key={c.id}
                  className="flex justify-between gap-3 border-b border-slate-100 pb-3"
                >
                  <span>{c.name}</span>
                  <strong>{peso(c.amount)}</strong>
                </div>
              ))}
              <div className="flex justify-between gap-3">
                <span>Total of salary components</span>
                <strong>{peso(data.componentTotal)}</strong>
              </div>
              <div className="flex justify-between gap-3 rounded-xl bg-blue-600 px-4 py-4 font-bold text-white">
                <span>Total monthly salary</span>
                <span>{peso(data.totalMonthlySalary)}</span>
              </div>
            </div>
          </section>
          <section className="panel">
            <PanelTitle
              title="How the rates are calculated"
              subtitle="The exact formulas from the practical examination."
            />
            <div className="space-y-3 text-sm">
              <div className="flex flex-wrap justify-between gap-2 rounded-lg bg-slate-50 p-3">
                <span>Annual salary = total monthly salary × 12</span>
                <strong>{peso(data.rates.annualSalary)}</strong>
              </div>
              <div className="flex flex-wrap justify-between gap-2 rounded-lg bg-slate-50 p-3">
                <span>Daily rate = annual salary ÷ 314</span>
                <strong>{peso(data.rates.dailyRate)}</strong>
              </div>
              <div className="flex flex-wrap justify-between gap-2 rounded-lg bg-slate-50 p-3">
                <span>Hourly rate = daily rate ÷ 8</span>
                <strong>{peso(data.rates.hourlyRate)}</strong>
              </div>
              <div className="flex flex-wrap justify-between gap-2 rounded-lg bg-slate-50 p-3">
                <span>Per-minute rate = hourly rate ÷ 60</span>
                <strong>{peso(data.rates.perMinuteRate)}</strong>
              </div>
            </div>
            <p className="mt-4 text-xs text-slate-500">
              Calculation uses unrounded intermediate amounts. Display values
              are rounded to 2 decimal places. All components are treated as
              additions.
            </p>
          </section>
        </>
      )}
    </div>
  );
}
