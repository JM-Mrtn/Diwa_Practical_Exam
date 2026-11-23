import { useEffect, useState } from "react";
import { Pencil, Plus, Users, ChevronLeft, ChevronRight } from "lucide-react";

import { api } from "../api";
import { Alert, Empty, fullName, PanelTitle } from "../components/UI";

import type { Employee, EmployeeInput } from "../types";

// Maximum employees displayed per page
const ITEMS_PER_PAGE = 5;

const blank: EmployeeInput = {
  employeeId: "",
  firstName: "",
  middleName: "",
  lastName: "",
  dateHired: "",
};

export function EmployeesPage({
  employees,
  refresh,
}: {
  employees: Employee[];
  refresh: () => Promise<void>;
}) {
  const [form, setForm] = useState<EmployeeInput>({
    ...blank,
  });

  const [editingId, setEditingId] = useState<number | null>(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [saving, setSaving] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);

  // Calculate total pages
  const totalPages = Math.max(1, Math.ceil(employees.length / ITEMS_PER_PAGE));

  // Automatically correct the current page
  // when the employee count changes
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  // Calculate which employees should appear
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;

  const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, employees.length);

  const currentEmployees = employees.slice(startIndex, endIndex);

  // Edit employee
  const edit = (employee: Employee) => {
    setEditingId(employee.id);

    setForm({
      employeeId: employee.employeeId,
      firstName: employee.firstName,
      middleName: employee.middleName ?? "",
      lastName: employee.lastName,
      dateHired: employee.dateHired,
    });

    setError("");
    setSuccess("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // Reset form
  const reset = () => {
    setForm({ ...blank });
    setEditingId(null);
    setError("");
  };

  // Submit employee form
  async function submit(event: React.FormEvent) {
    event.preventDefault();

    setError("");
    setSuccess("");

    // Validate required fields
    if (
      !form.employeeId.trim() ||
      !form.firstName.trim() ||
      !form.lastName.trim() ||
      !form.dateHired
    ) {
      setError("Please fill in all required fields.");
      return;
    }

    setSaving(true);

    try {
      if (editingId !== null) {
        // Update existing employee
        await api.employees.update(editingId, form);

        setSuccess("Employee updated successfully.");
      } else {
        // Add new employee
        await api.employees.add(form);

        setSuccess("Employee added successfully.");
      }

      const wasAdding = editingId === null;

      reset();

      // Refresh employee directory
      await refresh();

      // Show newly added employee on the last page
      if (wasAdding) {
        setCurrentPage(
          Math.max(1, Math.ceil((employees.length + 1) / ITEMS_PER_PAGE)),
        );
      }
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  // Go to previous page
  const previousPage = () => {
    setCurrentPage((page) => Math.max(1, page - 1));
  };

  // Go to next page
  const nextPage = () => {
    setCurrentPage((page) => Math.min(totalPages, page + 1));
  };

  return (
    <div className="space-y-5">
      {/* EMPLOYEE FORM */}
      <section className="panel">
        <PanelTitle
          title={
            editingId !== null ? "Update employee" : "Onboard new employee"
          }
          subtitle="Enter employee details. Fields marked * are required."
        />

        <form
          onSubmit={submit}
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {(
            [
              ["employeeId", "Employee ID *"],
              ["firstName", "First name *"],
              ["middleName", "Middle name (optional)"],
              ["lastName", "Last name *"],
            ] as const
          ).map(([key, label]) => (
            <label key={key}>
              <span className="field-label">{label}</span>

              <input
                className="field"
                maxLength={key === "employeeId" ? 30 : 100}
                value={form[key]}
                onChange={(e) =>
                  setForm((v) => ({
                    ...v,
                    [key]: e.target.value,
                  }))
                }
                required={key !== "middleName"}
                placeholder={key === "employeeId" ? "e.g. EMP-001" : ""}
              />
            </label>
          ))}

          {/* DATE HIRED */}
          <label>
            <span className="field-label">Date hired *</span>

            <input
              className="field"
              type="date"
              required
              value={form.dateHired}
              onChange={(e) =>
                setForm((v) => ({
                  ...v,
                  dateHired: e.target.value,
                }))
              }
            />
          </label>

          {/* FORM BUTTONS */}
          <div className="flex items-end gap-2">
            <button
              type="submit"
              className="btn-primary flex-1"
              disabled={saving}
            >
              <Plus size={16} />

              {saving
                ? "Saving..."
                : editingId !== null
                  ? "Save changes"
                  : "Add employee"}
            </button>

            {editingId !== null && (
              <button type="button" onClick={reset} className="btn-secondary">
                Cancel
              </button>
            )}
          </div>
        </form>

        {/* ALERT MESSAGES */}
        <div className="mt-4 space-y-2">
          {error && <Alert message={error} />}

          {success && <Alert message={success} kind="success" />}
        </div>
      </section>

      {/* EMPLOYEE DIRECTORY */}
      <section className="panel">
        <PanelTitle
          title="Employee directory"
          subtitle={`${employees.length} employee(s) registered`}
        />

        {employees.length === 0 ? (
          <Empty>
            <Users className="mx-auto mb-2" />
            Add your first employee using the form above.
          </Empty>
        ) : (
          <>
            {/* EMPLOYEE TABLE */}
            <div className="overflow-x-auto">
              <table className="w-full min-w-[650px] text-sm">
                <thead className="table-head">
                  <tr>
                    <th className="px-4 py-3">Employee ID</th>

                    <th className="px-4 py-3">Full name</th>

                    <th className="px-4 py-3">Date hired</th>

                    <th className="px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {currentEmployees.map((employee) => (
                    <tr key={employee.id}>
                      <td className="px-4 py-4 font-bold text-slate-800">
                        {employee.employeeId}
                      </td>

                      <td className="px-4 py-4">{fullName(employee)}</td>

                      <td className="px-4 py-4">{employee.dateHired}</td>

                      <td className="px-4 py-4 text-right">
                        <button
                          type="button"
                          className="btn-secondary"
                          onClick={() => edit(employee)}
                        >
                          <Pencil size={14} />
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* PAGINATION */}
            <div className="mt-5 flex flex-col gap-4 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
              {/* EMPLOYEE COUNT */}
              <p className="text-sm text-slate-500">
                Showing{" "}
                <span className="font-semibold text-slate-800">
                  {startIndex + 1}
                  {"–"}
                  {endIndex}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-slate-800">
                  {employees.length}
                </span>{" "}
                employees
              </p>

              <div className="flex items-center justify-between gap-2">
                {/* PREVIOUS BUTTON */}
                <button
                  type="button"
                  onClick={previousPage}
                  disabled={currentPage === 1}
                  className="btn-secondary disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronLeft size={16} />
                  Previous
                </button>

                {/* PAGE NUMBERS */}
                <div className="flex items-center gap-1">
                  {Array.from(
                    { length: totalPages },
                    (_, index) => index + 1,
                  ).map((page) => (
                    <button
                      key={page}
                      type="button"
                      onClick={() => setCurrentPage(page)}
                      aria-current={currentPage === page ? "page" : undefined}
                      className={`flex h-9 w-9 items-center justify-center rounded-lg text-sm font-semibold transition ${
                        currentPage === page
                          ? "bg-blue-600 text-white"
                          : "text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>

                {/* NEXT BUTTON */}
                <button
                  type="button"
                  onClick={nextPage}
                  disabled={currentPage === totalPages}
                  className="btn-secondary disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
