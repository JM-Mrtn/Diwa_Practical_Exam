export interface Employee {
  id: number;
  employeeId: string;
  firstName: string;
  middleName: string | null;
  lastName: string;
  dateHired: string;
}
export interface EmployeeInput {
  employeeId: string;
  firstName: string;
  middleName: string;
  lastName: string;
  dateHired: string;
}
export interface SalaryAssignment {
  id: number;
  employeeId: number;
  monthlyBasicSalary: string;
}
export interface Component {
  id: number;
  name: string;
}
export interface AssignedComponent {
  id: number;
  employeeId: number;
  componentId: number;
  amount: string;
  component: Component;
}
export interface SalaryBreakdown {
  employee: { id: number; employeeId: string; fullName: string };
  monthlyBasicSalary: number;
  components: {
    id: number;
    componentId: number;
    name: string;
    amount: number;
  }[];
  componentTotal: number;
  totalMonthlySalary: number;
  rates: {
    annualSalary: number;
    dailyRate: number;
    hourlyRate: number;
    perMinuteRate: number;
  };
  formula: {
    annualWorkingDays: number;
    hoursPerDay: number;
    minutesPerHour: number;
  };
}
