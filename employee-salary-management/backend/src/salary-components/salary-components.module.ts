import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { EmployeesModule } from "../employees/employees.module";
import { SalaryComponent } from "./salary-component.entity";
import { EmployeeSalaryComponent } from "./employee-salary-component.entity";
import { SalaryComponentsService } from "./salary-components.service";
import { SalaryComponentsController } from "./salary-components.controller";
@Module({
  imports: [
    TypeOrmModule.forFeature([SalaryComponent, EmployeeSalaryComponent]),
    EmployeesModule,
  ],
  providers: [SalaryComponentsService],
  controllers: [SalaryComponentsController],
  exports: [SalaryComponentsService],
})
export class SalaryComponentsModule {}
