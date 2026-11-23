import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { Employee } from "../employees/employee.entity";

@Entity("salary_assignments")
export class SalaryAssignment {
  @PrimaryGeneratedColumn() id!: number;
  @Column({ name: "employee_id", unique: true }) employeeId!: number;
  @ManyToOne(() => Employee, (employee) => employee.salaryAssignments, {
    onDelete: "RESTRICT",
  })
  @JoinColumn({ name: "employee_id" })
  employee!: Employee;
  @Column({
    name: "monthly_basic_salary",
    type: "numeric",
    precision: 14,
    scale: 2,
  })
  monthlyBasicSalary!: string;
  @UpdateDateColumn({ name: "updated_at" }) updatedAt!: Date;
}
