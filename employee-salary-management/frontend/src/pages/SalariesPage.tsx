import { useEffect, useState } from "react";
import { Save } from "lucide-react";
import { api } from "../api";
import {
  Alert,
  EmployeeSelect,
  Empty,
  PanelTitle,
  peso,
} from "../components/UI";
import type { Employee, SalaryAssignment } from "../types";

export function SalariesPage({
  employees,
  selected,
  onSelect,
  onChanged,
}: {
  employees: Employee[];
  selected: number | null;
  onSelect: (id: number | null) => void;
  onChanged: () => void;
}) {
  const [current, setCurrent] = useState<SalaryAssignment | null>(null);
  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    let active = true;
    setError("");
    setSuccess("");
    setAmount("");
    setCurrent(null);
    if (selected === null) return;
    api.salaries
      .get(selected)
      .then((v) => {
        if (active) {
          setCurrent(v);
          setAmount(v?.monthlyBasicSalary ?? "");
        }
      })
      .catch((e) => {
        if (active) setError((e as Error).message);
      });
    return () => {
      active = false;
    };
  }, [selected]);
  async function save(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (
      amount.trim() === "" ||
      !Number.isFinite(Number(amount)) ||
      Number(amount) < 0 ||
      !/^(?:\d+)(?:\.\d{1,2})?$/.test(amount.trim())
    ) {
      setError("Enter a valid, non-negative salary (up to 2 decimal places).");
      return;
    }
    if (selected === null) return;
    setSaving(true);
    try {
      const data = await api.salaries.save(selected, Number(amount));
      setCurrent(data);
      setAmount(data.monthlyBasicSalary);
      setSuccess(
        "Monthly basic salary saved. Computed rates will use the updated amount.",
      );
      onChanged();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSaving(false);
    }
  }
  return (
    <section className="panel">
      <PanelTitle
        title="Assign monthly basic salary"
        subtitle="Choose an employee and save or update their monthly base pay."
      />
      <div className="max-w-2xl space-y-5">
        <EmployeeSelect
          employees={employees}
          value={selected}
          onChange={onSelect}
        />
        {selected === null ? (
          <Empty>Select an employee to assign a salary.</Empty>
        ) : (
          <>
            <div className="rounded-xl bg-blue-50 p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">
                Current monthly basic salary
              </p>
              <p className="mt-2 text-3xl font-extrabold text-blue-950">
                {current
                  ? peso(current.monthlyBasicSalary)
                  : "Not assigned yet"}
              </p>
            </div>
            <form onSubmit={save} className="space-y-4">
              <label>
                <span className="field-label">Monthly basic salary (₱) *</span>
                <input
                  className="field"
                  type="number"
                  min="0"
                  step="0.01"
                  required
                  placeholder="e.g. 25000.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </label>
              <button className="btn-primary" disabled={saving}>
                <Save size={16} />
                {saving ? "Saving..." : "Save monthly salary"}
              </button>
            </form>
          </>
        )}
        {error && <Alert message={error} />}
        {success && <Alert message={success} kind="success" />}
      </div>
    </section>
  );
}
