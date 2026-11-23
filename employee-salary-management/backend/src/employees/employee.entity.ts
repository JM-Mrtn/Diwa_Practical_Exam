import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";

import { SalaryAssignment } from "../salaries/salary-assignment.entity";
import { EmployeeSalaryComponent } from "../salary-components/employee-salary-component.entity";

@Entity("employees")
export class Employee {
  // Automatically generated employee database ID
  @PrimaryGeneratedColumn()
  id!: number;

  // Unique employee ID provided by the user
  @Column({
    name: "employee_id",
    type: "varchar",
    length: 30,
    unique: true,
  })
  employeeId!: string;

  // Employee first name
  @Column({
    name: "first_name",
    type: "varchar",
    length: 100,
  })
  firstName!: string;

  // Middle name is optional
  @Column({
    name: "middle_name",
    type: "varchar",
    length: 100,
    nullable: true,
  })
  middleName!: string | null;

  // Employee last name
  @Column({
    name: "last_name",
    type: "varchar",
    length: 100,
  })
  lastName!: string;

  // Date the employee was hired
  @Column({
    name: "date_hired",
    type: "date",
  })
  dateHired!: string;

  // Automatically records when the employee was created
  @CreateDateColumn({
    name: "created_at",
  })
  createdAt!: Date;

  // One employee can have multiple salary assignments
  @OneToMany(() => SalaryAssignment, (salary) => salary.employee)
  salaryAssignments!: SalaryAssignment[];

  // One employee can have multiple salary components
  @OneToMany(() => EmployeeSalaryComponent, (item) => item.employee)
  employeeComponents!: EmployeeSalaryComponent[];
}
