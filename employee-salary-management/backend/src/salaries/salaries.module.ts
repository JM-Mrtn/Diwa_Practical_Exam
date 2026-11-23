import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SalaryAssignment } from './salary-assignment.entity';
import { EmployeesModule } from '../employees/employees.module';
import { SalariesController } from './salaries.controller';
import { SalariesService } from './salaries.service';
@Module({ imports: [TypeOrmModule.forFeature([SalaryAssignment]), EmployeesModule], controllers: [SalariesController], providers: [SalariesService], exports: [SalariesService] })
export class SalariesModule {}
