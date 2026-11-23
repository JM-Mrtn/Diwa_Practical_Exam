import { useEffect, useState } from "react";
import {
  Calculator,
  CircleDollarSign,
  FileCode2,
  LayoutDashboard,
  ListPlus,
  Users,
} from "lucide-react";
import { api } from "./api";
import { Alert } from "./components/UI";
import { EmployeesPage } from "./pages/EmployeesPage";
import { SalariesPage } from "./pages/SalariesPage";
import { ComponentsPage } from "./pages/ComponentsPage";
import { RatesPage } from "./pages/RatesPage";
import type { Employee } from "./types";

type Page = "employees" | "salaries" | "components" | "rates";
const pages = [
  { key: "employees", label: "Employee Onboarding", icon: Users },
  { key: "salaries", label: "Salary Assignment", icon: CircleDollarSign },
  { key: "components", label: "Salary Components", icon: ListPlus },
  { key: "rates", label: "Salary Computation", icon: Calculator },
] as const;
export default function App() {
  const [page, setPage] = useState<Page>("employees");
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [revision, setRevision] = useState(0);
  const [loadError, setLoadError] = useState("");
  const [loading, setLoading] = useState(true);
  async function reload() {
    try {
      setEmployees(await api.employees.list());
      setLoadError("");
    } catch (e) {
      setLoadError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    void reload();
  }, []);
  const notifyChange = () => setRevision((v) => v + 1);
  return (
    <div className="min-h-screen lg:flex">
      <aside className="bg-navy px-4 py-5 text-white lg:min-h-screen lg:w-72 lg:shrink-0 lg:px-5 lg:py-8">
        <div className="mb-7 flex items-center gap-3 lg:mb-10">
          <div className="rounded-xl bg-blue-500 p-2.5">
            <LayoutDashboard size={24} />
          </div>
          <div>
            <h1 className="text-lg font-extrabold leading-tight">
              Payroll Manager
            </h1>
            <p className="text-xs text-slate-300">Employee Salary System</p>
          </div>
        </div>
        <div className="mb-3 hidden px-3 text-xs font-semibold uppercase tracking-widest text-slate-400 lg:block">
          Management
        </div>
        <nav
          className="flex gap-2 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible"
          aria-label="Main navigation"
        >
          {pages.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setPage(key)}
              className={`flex min-w-max items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold transition lg:w-full ${page === key ? "bg-blue-600 text-white" : "text-slate-300 hover:bg-white/10 hover:text-white"}`}
            >
              <Icon size={18} />
              {label}
            </button>
          ))}
        </nav>
      </aside>
      <main className="min-w-0 flex-1">
        <header className="border-b border-slate-200 bg-white px-5 py-5 md:px-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-blue-600">
                Practical examination project
              </p>
              <h2 className="mt-1 text-2xl font-extrabold text-slate-900">
                {pages.find((p) => p.key === page)?.label}
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Manage employees, salaries, components and calculated rates.
              </p>
            </div>
            <a
              className="btn-secondary"
              target="_blank"
              rel="noreferrer"
              href="http://localhost:3000/docs"
            >
              <FileCode2 size={16} /> API docs
            </a>
          </div>
        </header>
        <div className="mx-auto max-w-6xl space-y-5 p-5 md:p-8">
          {loadError && <Alert message={loadError} />}
          {loading ? (
            <div className="panel">Loading employees...</div>
          ) : (
            <>
              {page === "employees" && (
                <EmployeesPage employees={employees} refresh={reload} />
              )}
              {page === "salaries" && (
                <SalariesPage
                  employees={employees}
                  selected={selected}
                  onSelect={setSelected}
                  onChanged={notifyChange}
                />
              )}
              {page === "components" && (
                <ComponentsPage
                  employees={employees}
                  selected={selected}
                  onSelect={setSelected}
                  onChanged={notifyChange}
                />
              )}
              {page === "rates" && (
                <RatesPage
                  employees={employees}
                  selected={selected}
                  onSelect={setSelected}
                  revision={revision}
                />
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
