import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";

import { EmployeeSalaryComponent } from "./employee-salary-component.entity";

@Entity("salary_components")
@Index("uq_active_component_name", ["name"], {
  unique: true,
  where: '"deleted_at" IS NULL',
})
export class SalaryComponent {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 120 })
  name!: string;

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;

  // NULL = active catalog record
  // Timestamp = soft deleted
  @Column({
    name: "deleted_at",
    type: "timestamp",
    nullable: true,
  })
  deletedAt!: Date | null;

  // NULL = enabled catalog component
  // Timestamp = disabled catalog component
  @Column({
    name: "disabled_at",
    type: "timestamp",
    nullable: true,
  })
  disabledAt!: Date | null;

  @OneToMany(
    () => EmployeeSalaryComponent,
    (assignment) => assignment.component,
  )
  assignments!: EmployeeSalaryComponent[];
}
