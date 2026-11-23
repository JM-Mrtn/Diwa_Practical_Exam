import type {
  AssignedComponent,
  Component,
  Employee,
  EmployeeInput,
  SalaryAssignment,
  SalaryBreakdown,
} from "./types";

// Backend API address
const BASE = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

// Reusable function for communicating with NestJS
async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  let response: Response;

  try {
    response = await fetch(`${BASE}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });
  } catch {
    throw new Error(
      "Cannot connect to the backend. Start NestJS and PostgreSQL first.",
    );
  }

  // Read response as text first
  const responseText = await response.text();

  let data: unknown = null;

  // Parse JSON only when response contains data
  if (responseText.trim() !== "") {
    try {
      data = JSON.parse(responseText);
    } catch {
      if (response.ok) {
        throw new Error("The backend returned an invalid JSON response.");
      }
    }
  }

  // Handle backend errors
  if (!response.ok) {
    const body = data as {
      message?: string | string[];
    } | null;

    const message = Array.isArray(body?.message)
      ? body.message.join("; ")
      : body?.message;

    throw new Error(message || `Request failed (${response.status})`);
  }

  return data as T;
}

// Helper for POST, PUT, and PATCH requests
const json = (method: string, data: unknown): RequestInit => ({
  method,
  body: JSON.stringify(data),
});

// ==================================
// API FUNCTIONS
// ==================================

export const api = {
  // ==================================
  // 1. EMPLOYEE ONBOARDING
  // ==================================
  employees: {
    // Retrieve all employees
    list: () => request<Employee[]>("/employees"),

    // Add a new employee
    add: (data: EmployeeInput) =>
      request<Employee>("/employees", json("POST", data)),

    // Update employee information
    update: (id: number, data: EmployeeInput) =>
      request<Employee>(`/employees/${id}`, json("PATCH", data)),
  },

  // ==================================
  // 2. SALARY ASSIGNMENT
  // ==================================
  salaries: {
    // Retrieve employee's current salary
    get: (employeeId: number) =>
      request<SalaryAssignment | null>(`/salaries/${employeeId}`),

    // Assign or update monthly basic salary
    save: (employeeId: number, amount: number) =>
      request<SalaryAssignment>(
        `/salaries/${employeeId}`,
        json("PUT", {
          monthlyBasicSalary: amount,
        }),
      ),
  },

  // ==================================
  // 3. SALARY COMPONENTS
  // ==================================
  components: {
    // ----------------------------------
    // COMPONENT CATALOG
    // ----------------------------------

    // Get available catalog components
    list: () => request<Component[]>("/salary-components"),

    // Create a new component
    create: (name: string) =>
      request<Component>("/salary-components", json("POST", { name })),

    // Rename a component
    rename: (id: number, name: string) =>
      request<Component>(`/salary-components/${id}`, json("PATCH", { name })),

    // Disable catalog component
    // Affects all employees using this component
    disable: (id: number) =>
      request<Component>(`/salary-components/${id}/disable`, json("PATCH", {})),

    // Enable catalog component
    enable: (id: number) =>
      request<Component>(`/salary-components/${id}/enable`, json("PATCH", {})),

    // Soft delete catalog component
    remove: (id: number) =>
      request<{ message: string }>(`/salary-components/${id}`, {
        method: "DELETE",
      }),

    // ----------------------------------
    // EMPLOYEE COMPONENT ASSIGNMENTS
    // ----------------------------------

    // Get components assigned to an employee
    assigned: (employeeId: number) =>
      request<AssignedComponent[]>(`/employees/${employeeId}/components`),

    // Assign component to employee
    assign: (employeeId: number, componentId: number, amount: number) =>
      request<AssignedComponent>(
        `/employees/${employeeId}/components`,
        json("POST", {
          componentId,
          amount,
        }),
      ),

    // Update assigned component amount
    changeAmount: (employeeId: number, assignedId: number, amount: number) =>
      request<AssignedComponent>(
        `/employees/${employeeId}/components/${assignedId}`,
        json("PATCH", { amount }),
      ),

    // Disable component for one employee only
    disableAssignment: (employeeId: number, assignedId: number) =>
      request<AssignedComponent>(
        `/employees/${employeeId}/components/${assignedId}/disable`,
        json("PATCH", {}),
      ),

    // Enable component for one employee only
    enableAssignment: (employeeId: number, assignedId: number) =>
      request<AssignedComponent>(
        `/employees/${employeeId}/components/${assignedId}/enable`,
        json("PATCH", {}),
      ),

    // Soft delete employee component assignment
    unassign: (employeeId: number, assignedId: number) =>
      request<{ message: string }>(
        `/employees/${employeeId}/components/${assignedId}`,
        { method: "DELETE" },
      ),
  },

  // ==================================
  // 4. SALARY RATE COMPUTATION
  // ==================================
  rates: {
    // Retrieve computed salary rates
    compute: (employeeId: number) =>
      request<SalaryBreakdown>(`/salary-rates/${employeeId}`),
  },
};
