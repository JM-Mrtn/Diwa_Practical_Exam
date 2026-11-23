import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import {
  CheckCircle2,
  Pencil,
  Plus,
  Power,
  RotateCcw,
  Trash2,
  X,
} from "lucide-react";
import { api } from "../api";
import {
  Alert,
  EmployeeSelect,
  Empty,
  PanelTitle,
  peso,
} from "../components/UI";
import type { AssignedComponent, Component, Employee } from "../types";

type ModalState =
  | { type: "amount"; assignment: AssignedComponent; value: string }
  | { type: "rename"; component: Component; value: string }
  | {
      type: "confirm";
      action:
        | "disable-assignment"
        | "enable-assignment"
        | "remove-assignment"
        | "disable-catalog"
        | "enable-catalog"
        | "remove-catalog";
      assignment?: AssignedComponent;
      component?: Component;
    }
  | null;

export function ComponentsPage({
  employees,
  selected,
  onSelect,
  onChanged,
}: {
  employees: Employee[];
  selected: number | null;
  onSelect: (v: number | null) => void;
  onChanged: () => void;
}) {
  const [catalog, setCatalog] = useState<Component[]>([]);
  const [assigned, setAssigned] = useState<AssignedComponent[]>([]);
  const [newName, setNewName] = useState("");
  const [componentId, setComponentId] = useState("");
  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [busy, setBusy] = useState(false);
  const [modal, setModal] = useState<ModalState>(null);

  const selectedEmployee = employees.find(
    (employee) => employee.id === selected,
  );
  const employeeName = selectedEmployee
    ? [
        selectedEmployee.firstName,
        selectedEmployee.middleName,
        selectedEmployee.lastName,
      ]
        .filter(Boolean)
        .join(" ")
    : "";
  const assignableCatalog = catalog.filter(
    (component) => !component.disabledAt && !component.deletedAt,
  );

  async function reload() {
    const [components, employeeComponents] = await Promise.all([
      api.components.list(),
      selected === null
        ? Promise.resolve([])
        : api.components.assigned(selected),
    ]);
    setCatalog(components);
    setAssigned(employeeComponents);
    onChanged();
  }

  useEffect(() => {
    let active = true;
    setError("");
    setSuccess("");
    Promise.all([
      api.components.list(),
      selected === null
        ? Promise.resolve([])
        : api.components.assigned(selected),
    ])
      .then(([components, employeeComponents]) => {
        if (active) {
          setCatalog(components);
          setAssigned(employeeComponents);
        }
      })
      .catch((e) => {
        if (active) setError((e as Error).message);
      });
    return () => {
      active = false;
    };
  }, [selected]);

  async function action(
    fn: () => Promise<unknown>,
    message: string,
  ): Promise<boolean> {
    setBusy(true);
    setError("");
    setSuccess("");
    try {
      await fn();
      await reload();
      setSuccess(message);
      return true;
    } catch (e) {
      setError((e as Error).message);
      return false;
    } finally {
      setBusy(false);
    }
  }

  const validAmount = (value: string) =>
    value.trim() !== "" &&
    /^(?:\d+)(?:\.\d{1,2})?$/.test(value.trim()) &&
    Number.isFinite(Number(value)) &&
    Number(value) >= 0;

  async function create(e: FormEvent) {
    e.preventDefault();
    if (!newName.trim()) {
      setError("Enter a component name.");
      return;
    }
    await action(async () => {
      await api.components.create(newName.trim());
      setNewName("");
    }, "New component created. It can be assigned to any employee.");
  }

  async function assign(e: FormEvent) {
    e.preventDefault();
    if (selected === null || !componentId) {
      setError("Select an employee and component.");
      return;
    }
    if (!validAmount(amount)) {
      setError(
        "Enter a valid non-negative amount with up to 2 decimal places.",
      );
      return;
    }
    await action(async () => {
      await api.components.assign(
        selected,
        Number(componentId),
        Number(amount),
      );
      setAmount("");
      setComponentId("");
    }, "Component assigned to employee.");
  }

  function openAmount(assignment: AssignedComponent) {
    setError("");
    setModal({ type: "amount", assignment, value: String(assignment.amount) });
  }

  function openRename(component: Component) {
    setError("");
    setModal({ type: "rename", component, value: component.name });
  }

  function confirm(
    actionName: Extract<ModalState, { type: "confirm" }>["action"],
    data: { assignment?: AssignedComponent; component?: Component },
  ) {
    setError("");
    setModal({ type: "confirm", action: actionName, ...data });
  }

  async function submitModal(e: FormEvent) {
    e.preventDefault();
    if (!modal || modal.type === "confirm") return;
    if (modal.type === "amount") {
      if (selected === null) return;
      if (!validAmount(modal.value)) {
        setError(
          "Enter a valid non-negative amount with up to 2 decimal places.",
        );
        return;
      }
      const saved = await action(
        () =>
          api.components.changeAmount(
            selected,
            modal.assignment.id,
            Number(modal.value),
          ),
        "Assigned amount updated successfully.",
      );
      if (saved) setModal(null);
    } else {
      if (!modal.value.trim()) {
        setError("Component name is required.");
        return;
      }
      const saved = await action(
        () => api.components.rename(modal.component.id, modal.value.trim()),
        "Component renamed for everyone who uses it.",
      );
      if (saved) setModal(null);
    }
  }

  async function runConfirmedAction() {
    if (!modal || modal.type !== "confirm") return;
    let operation: (() => Promise<unknown>) | undefined;
    let message = "";
    const id = modal.assignment?.id;
    const componentIdToChange = modal.component?.id;
    switch (modal.action) {
      case "disable-assignment":
        if (selected !== null && id !== undefined)
          operation = () => api.components.disableAssignment(selected, id);
        message =
          "Employee component disabled and excluded from salary computation.";
        break;
      case "enable-assignment":
        if (selected !== null && id !== undefined)
          operation = () => api.components.enableAssignment(selected, id);
        message =
          "Employee component enabled and included in salary computation.";
        break;
      case "remove-assignment":
        if (selected !== null && id !== undefined)
          operation = () => api.components.unassign(selected, id);
        message = "Employee component removed (soft deleted).";
        break;
      case "disable-catalog":
        if (componentIdToChange !== undefined)
          operation = () => api.components.disable(componentIdToChange);
        message =
          "Catalog component disabled. All its employee assignments are excluded from salary computation.";
        break;
      case "enable-catalog":
        if (componentIdToChange !== undefined)
          operation = () => api.components.enable(componentIdToChange);
        message = "Catalog component enabled again.";
        break;
      case "remove-catalog":
        if (componentIdToChange !== undefined)
          operation = () => api.components.remove(componentIdToChange);
        message =
          "Catalog component soft deleted. Historical records remain in the database.";
        break;
    }
    if (operation) {
      const completed = await action(operation, message);
      if (completed) setModal(null);
    }
  }

  const modalTitle =
    modal?.type === "amount"
      ? "Update Component Amount"
      : modal?.type === "rename"
        ? "Rename Salary Component"
        : modal?.type === "confirm"
          ? {
              "disable-assignment": "Disable Employee Component",
              "enable-assignment": "Enable Employee Component",
              "remove-assignment": "Remove Employee Component",
              "disable-catalog": "Disable Catalog Component",
              "enable-catalog": "Enable Catalog Component",
              "remove-catalog": "Remove Catalog Component",
            }[modal.action]
          : "";

  const modalDescription =
    modal?.type === "confirm"
      ? {
          "disable-assignment":
            "This assignment will be kept, but will no longer contribute to this employee’s salary computation.",
          "enable-assignment":
            "This assignment will become active and will contribute to salary computation again.",
          "remove-assignment":
            "This disabled assignment will be soft deleted. Its database history will remain.",
          "disable-catalog":
            "This component will become unavailable to all employees and will be excluded from every salary computation using it.",
          "enable-catalog":
            "This component will become available for assignment again. Existing employee assignments will keep their own enabled or disabled state.",
          "remove-catalog":
            "This disabled catalog component will be soft deleted. Historical assignments will remain in the database.",
        }[modal.action]
      : "";

  const modalItemName =
    modal?.type === "amount"
      ? modal.assignment.component.name
      : modal?.type === "rename"
        ? modal.component.name
        : modal?.type === "confirm"
          ? (modal.assignment?.component.name ?? modal.component?.name)
          : "";

  return (
    <div className="space-y-5">
      <section className="panel">
        <PanelTitle
          title="Create salary component"
          subtitle="No fixed list — make your own names such as Rice Allowance or Bonus."
        />
        <form onSubmit={create} className="flex flex-col gap-3 sm:flex-row">
          <input
            className="field flex-1"
            maxLength={120}
            required
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="New component name"
          />
          <button type="submit" disabled={busy} className="btn-primary">
            <Plus size={16} /> Create component
          </button>
        </form>
      </section>

      <section className="panel">
        <PanelTitle
          title="Assign components to an employee"
          subtitle="Disable an assignment to pause it. Remove becomes available only after it is disabled."
        />
        <div className="space-y-5">
          <EmployeeSelect
            employees={employees}
            value={selected}
            onChange={onSelect}
          />
          {selected !== null ? (
            <>
              <form
                onSubmit={assign}
                className="grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end"
              >
                <label>
                  <span className="field-label">Component *</span>
                  <select
                    required
                    value={componentId}
                    onChange={(e) => setComponentId(e.target.value)}
                    className="field"
                  >
                    <option value="">Choose component...</option>
                    {assignableCatalog.map((component) => (
                      <option value={component.id} key={component.id}>
                        {component.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  <span className="field-label">Monthly amount (₱) *</span>
                  <input
                    required
                    type="number"
                    min="0"
                    step="0.01"
                    className="field"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                </label>
                <button
                  type="submit"
                  disabled={busy || assignableCatalog.length === 0}
                  className="btn-primary"
                >
                  <Plus size={16} /> Assign
                </button>
              </form>
              {assigned.length === 0 ? (
                <Empty>No components assigned to this employee yet.</Empty>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[650px] text-sm">
                    <thead className="table-head">
                      <tr>
                        <th className="px-4 py-3">Component</th>
                        <th className="px-4 py-3">Amount</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {assigned.map((item) => {
                        const catalogUnavailable = Boolean(
                          item.component.disabledAt || item.component.deletedAt,
                        );
                        const isDisabled = Boolean(
                          item.disabledAt || catalogUnavailable,
                        );
                        return (
                          <tr key={item.id}>
                            <td className="px-4 py-3 font-semibold">
                              {item.component.name}
                            </td>
                            <td className="px-4 py-3">{peso(item.amount)}</td>
                            <td className="px-4 py-3">
                              {item.component.deletedAt ? (
                                <span className="status-badge bg-red-50 text-red-700">
                                  Catalog removed
                                </span>
                              ) : isDisabled ? (
                                <span className="status-badge bg-amber-50 text-amber-700">
                                  Disabled
                                </span>
                              ) : (
                                <span className="status-badge bg-emerald-50 text-emerald-700">
                                  Active
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex justify-end gap-2">
                                {!isDisabled && (
                                  <>
                                    <button
                                      type="button"
                                      className="btn-secondary"
                                      disabled={busy}
                                      onClick={() => openAmount(item)}
                                    >
                                      <Pencil size={14} /> Edit
                                    </button>
                                    <button
                                      type="button"
                                      className="btn-secondary"
                                      disabled={busy}
                                      onClick={() =>
                                        confirm("disable-assignment", {
                                          assignment: item,
                                        })
                                      }
                                    >
                                      <Power size={14} /> Disable
                                    </button>
                                  </>
                                )}
                                {isDisabled &&
                                  !item.component.deletedAt &&
                                  !item.component.disabledAt && (
                                    <button
                                      type="button"
                                      className="btn-secondary"
                                      disabled={busy}
                                      onClick={() =>
                                        confirm("enable-assignment", {
                                          assignment: item,
                                        })
                                      }
                                    >
                                      <RotateCcw size={14} /> Enable
                                    </button>
                                  )}
                                {isDisabled && (
                                  <button
                                    type="button"
                                    className="btn-danger"
                                    disabled={busy}
                                    onClick={() =>
                                      confirm("remove-assignment", {
                                        assignment: item,
                                      })
                                    }
                                  >
                                    <Trash2 size={14} /> Remove
                                  </button>
                                )}
                                {item.component.disabledAt && (
                                  <span className="self-center text-xs text-slate-500">
                                    Enable catalog first
                                  </span>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          ) : (
            <Empty>
              Select an employee to view or assign salary components.
            </Empty>
          )}
        </div>
      </section>

      <section className="panel">
        <PanelTitle
          title="Manage component catalog"
          subtitle="Disable a component to pause it for everyone. Enable restores it. Remove is available only when disabled."
        />
        {catalog.length === 0 ? (
          <Empty>There are no active components. Create one above.</Empty>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {catalog.map((component) => (
              <div
                key={component.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 p-3"
              >
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-800">
                    {component.name}
                  </p>
                  {component.disabledAt && (
                    <span className="mt-1 inline-flex rounded-full bg-amber-50 px-2 py-1 text-xs font-medium text-amber-700">
                      Disabled for all employees
                    </span>
                  )}
                </div>
                <div className="flex shrink-0 gap-1">
                  <button
                    type="button"
                    aria-label={`Rename ${component.name}`}
                    title="Rename"
                    className="rounded-lg p-2 text-slate-600 hover:bg-slate-100"
                    disabled={busy}
                    onClick={() => openRename(component)}
                  >
                    <Pencil size={16} />
                  </button>
                  {!component.disabledAt ? (
                    <button
                      type="button"
                      className="btn-secondary"
                      disabled={busy}
                      onClick={() => confirm("disable-catalog", { component })}
                    >
                      <Power size={14} /> Disable
                    </button>
                  ) : (
                    <>
                      <button
                        type="button"
                        className="btn-secondary"
                        disabled={busy}
                        onClick={() => confirm("enable-catalog", { component })}
                      >
                        <RotateCcw size={14} /> Enable
                      </button>
                      <button
                        type="button"
                        className="btn-danger"
                        disabled={busy}
                        onClick={() => confirm("remove-catalog", { component })}
                      >
                        <Trash2 size={14} /> Remove
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {(error || success) && (
        <div className="space-y-2">
          {error && <Alert message={error} />}
          {success && <Alert message={success} kind="success" />}
        </div>
      )}

      {modal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget && !busy) {
              setModal(null);
              setError("");
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="component-modal-title"
            className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <div>
                <h2
                  id="component-modal-title"
                  className="text-lg font-bold text-slate-900"
                >
                  {modalTitle}
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  {modalDescription ||
                    "Update the selected component information."}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (!busy) {
                    setModal(null);
                    setError("");
                  }
                }}
                disabled={busy}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4 px-6 py-5">
              {modal.type === "amount" && (
                <form
                  id="component-modal-form"
                  onSubmit={submitModal}
                  className="space-y-4"
                >
                  <div>
                    <label className="field-label">Component</label>
                    <div className="rounded-lg bg-slate-50 px-3 py-3 text-sm font-semibold">
                      {modalItemName}
                    </div>
                  </div>
                  <div>
                    <label className="field-label">Employee</label>
                    <div className="rounded-lg bg-slate-50 px-3 py-3 text-sm">
                      {employeeName}
                    </div>
                  </div>
                  <label>
                    <span className="field-label">Monthly Amount (₱) *</span>
                    <input
                      autoFocus
                      type="number"
                      min="0"
                      step="0.01"
                      required
                      className="field"
                      value={modal.value}
                      onChange={(e) =>
                        setModal({ ...modal, value: e.target.value })
                      }
                    />
                  </label>
                </form>
              )}
              {modal.type === "rename" && (
                <form id="component-modal-form" onSubmit={submitModal}>
                  <label>
                    <span className="field-label">Component Name *</span>
                    <input
                      autoFocus
                      required
                      maxLength={120}
                      className="field"
                      value={modal.value}
                      onChange={(e) =>
                        setModal({ ...modal, value: e.target.value })
                      }
                    />
                  </label>
                </form>
              )}
              {modal.type === "confirm" && (
                <div className="rounded-xl border border-amber-100 bg-amber-50 p-4">
                  <div className="flex items-center gap-2 font-semibold text-amber-900">
                    <CheckCircle2 size={18} /> {modalItemName}
                  </div>
                  <p className="mt-2 text-sm text-amber-800">
                    {modalDescription}
                  </p>
                </div>
              )}
              {error && <Alert message={error} />}
            </div>
            <div className="flex flex-col-reverse gap-2 border-t border-slate-100 bg-slate-50 px-6 py-4 sm:flex-row sm:justify-end">
              <button
                type="button"
                disabled={busy}
                onClick={() => {
                  setModal(null);
                  setError("");
                }}
                className="btn-secondary justify-center"
              >
                Cancel
              </button>
              {modal.type === "amount" || modal.type === "rename" ? (
                <button
                  type="submit"
                  form="component-modal-form"
                  disabled={busy}
                  className="btn-primary justify-center"
                >
                  {busy ? "Saving..." : "Save Changes"}
                </button>
              ) : (
                <button
                  type="button"
                  disabled={busy}
                  onClick={runConfirmedAction}
                  className={
                    modal.action.startsWith("remove")
                      ? "btn-danger justify-center"
                      : "btn-primary justify-center"
                  }
                >
                  {busy
                    ? "Please wait..."
                    : modal.action.startsWith("disable")
                      ? "Confirm Disable"
                      : modal.action.startsWith("enable")
                        ? "Confirm Enable"
                        : "Confirm Remove"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
