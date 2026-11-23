import { Module } from "@nestjs/common";
import { EmployeesModule } from "../employees/employees.module";
import { SalariesModule } from "../salaries/salaries.module";
import { SalaryComponentsModule } from "../salary-components/salary-components.module";
import { SalaryRatesService } from "./salary-rates.service";
import { SalaryRatesController } from "./salary-rates.controller";
@Module({
  imports: [EmployeesModule, SalariesModule, SalaryComponentsModule],
  providers: [SalaryRatesService],
  controllers: [SalaryRatesController],
})
export class SalaryRatesModule {}
