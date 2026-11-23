import { Injectable } from "@nestjs/common";

import { EmployeesService } from "../employees/employees.service";
import { SalariesService } from "../salaries/salaries.service";
import { SalaryComponentsService } from "../salary-components/salary-components.service";

import { numberOf, pesos } from "../common/money";

@Injectable()
export class SalaryRatesService {
  constructor(
    private readonly employees: EmployeesService,
    private readonly salaries: SalariesService,
    private readonly components: SalaryComponentsService,
  ) {}

  async compute(employeeId: number) {
    // 1. Get employee information
    const employee = await this.employees.findOne(employeeId);

    // 2. Get employee's monthly basic salary
    const salary = await this.salaries.requireSalary(employeeId);

    // 3. Retrieve employee's assigned components
    const rows = await this.components.listForEmployee(employeeId);

    // 4. Include only active components
    const activeRows = rows.filter((row) => {
      const assignmentIsActive =
        row.deletedAt == null && row.disabledAt == null;

      const componentIsActive =
        row.component &&
        row.component.deletedAt == null &&
        row.component.disabledAt == null;

      return assignmentIsActive && componentIsActive;
    });

    // 5. Calculate basic salary
    const basic = numberOf(salary.monthlyBasicSalary);

    // 6. Create breakdown of active salary components
    const componentBreakdown = activeRows.map((row) => ({
      id: row.id,
      componentId: row.componentId,
      name: row.component.name,
      amount: pesos(numberOf(row.amount)),
    }));

    // 7. Calculate total component amount
    const componentTotal = pesos(
      componentBreakdown.reduce((sum, row) => sum + row.amount, 0),
    );

    // 8. Calculate total monthly salary
    const totalMonthly = pesos(basic + componentTotal);

    // 9. Calculate salary rates using examination formulas
    const annual = totalMonthly * 12;
    const daily = annual / 314;
    const hourly = daily / 8;
    const perMinute = hourly / 60;

    // 10. Return complete salary computation
    return {
      employee: {
        id: employee.id,
        employeeId: employee.employeeId,
        fullName: [employee.firstName, employee.middleName, employee.lastName]
          .filter(Boolean)
          .join(" "),
      },

      monthlyBasicSalary: pesos(basic),

      components: componentBreakdown,

      componentTotal,

      totalMonthlySalary: totalMonthly,

      rates: {
        annualSalary: pesos(annual),
        dailyRate: pesos(daily),
        hourlyRate: pesos(hourly),
        perMinuteRate: pesos(perMinute),
      },

      formula: {
        annualWorkingDays: 314,
        hoursPerDay: 8,
        minutesPerHour: 60,
      },
    };
  }
}
