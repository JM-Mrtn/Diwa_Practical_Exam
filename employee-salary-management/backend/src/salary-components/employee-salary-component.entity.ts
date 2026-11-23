import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";

import { Employee } from "../employees/employee.entity";
import { SalaryComponent } from "./salary-component.entity";

@Entity("employee_salary_components")
@Index("uq_active_employee_component", ["employeeId", "componentId"], {
  unique: true,
  where: '"deleted_at" IS NULL',
})
export class EmployeeSalaryComponent {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: "employee_id" })
  employeeId!: number;

  @ManyToOne(() => Employee, (employee) => employee.employeeComponents, {
    onDelete: "RESTRICT",
  })
  @JoinColumn({ name: "employee_id" })
  employee!: Employee;

  @Column({ name: "component_id" })
  componentId!: number;

  @ManyToOne(() => SalaryComponent, (component) => component.assignments, {
    onDelete: "RESTRICT",
  })
  @JoinColumn({ name: "component_id" })
  component!: SalaryComponent;

  @Column({
    type: "numeric",
    precision: 14,
    scale: 2,
  })
  amount!: string;

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;

  @Column({
    name: "deleted_at",
    type: "timestamp",
    nullable: true,
  })
  deletedAt!: Date | null;

  @Column({
    name: "disabled_at",
    type: "timestamp",
    nullable: true,
  })
  disabledAt!: Date | null;
}
