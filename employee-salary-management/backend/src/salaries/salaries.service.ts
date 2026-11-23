import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SalaryAssignment } from './salary-assignment.entity';
import { EmployeesService } from '../employees/employees.service';
import { AssignSalaryDto } from './dto/assign-salary.dto';
@Injectable()
export class SalariesService {
  constructor(@InjectRepository(SalaryAssignment) private readonly salaries: Repository<SalaryAssignment>, private readonly employees: EmployeesService) {}
  async findForEmployee(employeeId: number) {
    await this.employees.findOne(employeeId);
    return this.salaries.findOneBy({ employeeId });
  }
  async assign(employeeId: number, dto: AssignSalaryDto) {
    await this.employees.findOne(employeeId);
    let salary = await this.salaries.findOneBy({ employeeId });
    if (!salary) salary = this.salaries.create({ employeeId });
    salary.monthlyBasicSalary = dto.monthlyBasicSalary.toFixed(2);
    return this.salaries.save(salary);
  }
  async requireSalary(employeeId: number) {
    const salary = await this.findForEmployee(employeeId);
    if (!salary) throw new NotFoundException('Assign a monthly basic salary first');
    return salary;
  }
}
