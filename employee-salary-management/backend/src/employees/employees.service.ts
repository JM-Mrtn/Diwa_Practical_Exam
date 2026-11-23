import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Employee } from './employee.entity';
import { CreateEmployeeDto, UpdateEmployeeDto } from './dto/employee.dto';

@Injectable()
export class EmployeesService {
  constructor(@InjectRepository(Employee) private readonly employees: Repository<Employee>) {}

  findAll() { return this.employees.find({ order: { id: 'ASC' } }); }
  async findOne(id: number) {
    const employee = await this.employees.findOneBy({ id });
    if (!employee) throw new NotFoundException('Employee not found');
    return employee;
  }
  async create(dto: CreateEmployeeDto) {
    const data = this.clean(dto);
    if (!data.employeeId || !data.firstName || !data.lastName) throw new BadRequestException('Required fields cannot be blank');
    await this.preventDuplicate(data.employeeId);
    return this.employees.save(this.employees.create(data as Employee));
  }
  async update(id: number, dto: UpdateEmployeeDto) {
    const employee = await this.findOne(id);
    const data = this.clean(dto);
    if (data.employeeId !== undefined && !data.employeeId) throw new BadRequestException('Employee ID cannot be blank');
    if (data.firstName !== undefined && !data.firstName) throw new BadRequestException('First name cannot be blank');
    if (data.lastName !== undefined && !data.lastName) throw new BadRequestException('Last name cannot be blank');
    if (data.employeeId && data.employeeId !== employee.employeeId) await this.preventDuplicate(data.employeeId);
    Object.assign(employee, data);
    return this.employees.save(employee);
  }
  private clean(dto: UpdateEmployeeDto): UpdateEmployeeDto {
    return Object.fromEntries(Object.entries(dto).map(([k, v]) => [k, typeof v === 'string' ? v.trim() : v]));
  }
  private async preventDuplicate(employeeId: string) {
    const exists = await this.employees.findOneBy({ employeeId });
    if (exists) throw new ConflictException('Employee ID already exists');
  }
}
