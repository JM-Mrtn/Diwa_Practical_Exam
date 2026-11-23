import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";

import { InjectRepository } from "@nestjs/typeorm";

import { IsNull, Repository } from "typeorm";

import { SalaryComponent } from "./salary-component.entity";
import { EmployeeSalaryComponent } from "./employee-salary-component.entity";

import { EmployeesService } from "../employees/employees.service";

import {
  AssignComponentDto,
  CreateComponentDto,
  UpdateAssignedAmountDto,
  UpdateComponentDto,
} from "./dto/component.dto";

@Injectable()
export class SalaryComponentsService {
  constructor(
    @InjectRepository(SalaryComponent)
    private readonly components: Repository<SalaryComponent>,

    @InjectRepository(EmployeeSalaryComponent)
    private readonly assignments: Repository<EmployeeSalaryComponent>,

    private readonly employees: EmployeesService,
  ) {}

  // ==================================
  // COMPONENT CATALOG
  // ==================================

  // Show active and disabled components.
  // Do not show soft-deleted components.
  async listCatalog() {
    return this.components.find({
      where: {
        deletedAt: IsNull(),
      },
      order: {
        name: "ASC",
      },
    });
  }

  // Find a component that has not been soft deleted.
  private async findCatalogComponent(id: number) {
    const component = await this.components.findOne({
      where: {
        id,
        deletedAt: IsNull(),
      },
    });

    if (!component) {
      throw new NotFoundException("Salary component not found.");
    }

    return component;
  }

  // Only active and enabled components can be assigned.
  async getActiveComponent(id: number) {
    const component = await this.findCatalogComponent(id);

    if (component.disabledAt !== null) {
      throw new BadRequestException(
        "This salary component is disabled. Enable it before using it.",
      );
    }

    return component;
  }

  // Create catalog component.
  async createCatalog(dto: CreateComponentDto) {
    const name = dto.name.trim();

    if (!name) {
      throw new BadRequestException("Component name is required.");
    }

    await this.checkName(name);

    return this.components.save(
      this.components.create({
        name,
        deletedAt: null,
        disabledAt: null,
      }),
    );
  }

  // Rename component.
  async renameCatalog(id: number, dto: UpdateComponentDto) {
    const component = await this.findCatalogComponent(id);

    if (dto.name !== undefined) {
      const name = dto.name.trim();

      if (!name) {
        throw new BadRequestException("Component name is required.");
      }

      await this.checkName(name, id);

      component.name = name;
    }

    return this.components.save(component);
  }

  // Check duplicate component names.
  private async checkName(name: string, excludeId?: number) {
    const duplicate = await this.components
      .createQueryBuilder("component")
      .where("LOWER(component.name) = LOWER(:name)", { name })
      .andWhere("component.deletedAt IS NULL")
      .getOne();

    if (duplicate && duplicate.id !== excludeId) {
      throw new ConflictException(
        "An active component with this name already exists.",
      );
    }
  }

  // Disable catalog component.
  async disableCatalog(id: number) {
    const component = await this.findCatalogComponent(id);

    if (component.disabledAt !== null) {
      throw new BadRequestException("This component is already disabled.");
    }

    component.disabledAt = new Date();

    await this.components.save(component);

    return {
      message:
        "Component disabled. It will no longer contribute to salary computations for any employee.",
      component,
    };
  }

  // Enable catalog component.
  async enableCatalog(id: number) {
    const component = await this.findCatalogComponent(id);

    if (component.disabledAt === null) {
      throw new BadRequestException("This component is already enabled.");
    }

    component.disabledAt = null;

    await this.components.save(component);

    return {
      message: "Component enabled. It is available for assignment again.",
      component,
    };
  }

  // Soft delete catalog component.
  // Only disabled components can be removed.
  async softDeleteCatalog(id: number) {
    const component = await this.findCatalogComponent(id);

    if (component.disabledAt === null) {
      throw new BadRequestException(
        "Disable this component before removing it.",
      );
    }

    component.deletedAt = new Date();

    await this.components.save(component);

    return {
      message: "Component soft deleted. Historical database records remain.",
    };
  }

  // ==================================
  // EMPLOYEE COMPONENT ASSIGNMENTS
  // ==================================

  // Find an assignment that is not soft deleted.
  private async findAssignment(employeeId: number, assignedId: number) {
    await this.employees.findOne(employeeId);

    const assignment = await this.assignments.findOne({
      where: {
        id: assignedId,
        employeeId,
        deletedAt: IsNull(),
      },
      relations: {
        component: true,
      },
    });

    if (!assignment) {
      throw new NotFoundException("Employee component assignment not found.");
    }

    return assignment;
  }

  // List employee assignments, including disabled ones.
  async listForEmployee(employeeId: number) {
    await this.employees.findOne(employeeId);

    const rows = await this.assignments.find({
      where: {
        employeeId,
        deletedAt: IsNull(),
      },
      relations: {
        component: true,
      },
      order: {
        id: "ASC",
      },
    });

    // Hide assignments whose catalog component
    // has been soft deleted.
    return rows.filter(
      (row) => row.component && row.component.deletedAt === null,
    );
  }

  // Assign component to employee.
  async assign(employeeId: number, dto: AssignComponentDto) {
    await this.employees.findOne(employeeId);

    await this.getActiveComponent(dto.componentId);

    const duplicate = await this.assignments.findOne({
      where: {
        employeeId,
        componentId: dto.componentId,
        deletedAt: IsNull(),
      },
    });

    if (duplicate) {
      throw new ConflictException(
        "This employee already has this component. Enable the existing assignment instead.",
      );
    }

    return this.assignments.save(
      this.assignments.create({
        employeeId,
        componentId: dto.componentId,
        amount: dto.amount.toFixed(2),
        deletedAt: null,
        disabledAt: null,
      }),
    );
  }

  // Update assigned amount.
  async changeAmount(
    employeeId: number,
    assignedId: number,
    dto: UpdateAssignedAmountDto,
  ) {
    const assignment = await this.findAssignment(employeeId, assignedId);

    if (assignment.disabledAt !== null) {
      throw new BadRequestException(
        "Enable this assignment before updating its amount.",
      );
    }

    await this.getActiveComponent(assignment.componentId);

    assignment.amount = dto.amount.toFixed(2);

    return this.assignments.save(assignment);
  }

  // Disable employee assignment.
  async disableAssignment(employeeId: number, assignedId: number) {
    const assignment = await this.findAssignment(employeeId, assignedId);

    if (assignment.disabledAt !== null) {
      throw new BadRequestException(
        "This employee assignment is already disabled.",
      );
    }

    assignment.disabledAt = new Date();

    await this.assignments.save(assignment);

    return {
      message:
        "Employee component disabled. It is excluded from this employee salary computation.",
      assignment,
    };
  }

  // Enable employee assignment.
  async enableAssignment(employeeId: number, assignedId: number) {
    const assignment = await this.findAssignment(employeeId, assignedId);

    if (assignment.disabledAt === null) {
      throw new BadRequestException(
        "This employee assignment is already enabled.",
      );
    }

    // The catalog component must also be enabled.
    await this.getActiveComponent(assignment.componentId);

    assignment.disabledAt = null;

    await this.assignments.save(assignment);

    return {
      message:
        "Employee component enabled and included in salary computation again.",
      assignment,
    };
  }

  // Soft delete employee assignment.
  // Only disabled assignments can be removed.
  async remove(employeeId: number, assignedId: number) {
    const assignment = await this.findAssignment(employeeId, assignedId);

    if (assignment.disabledAt === null) {
      throw new BadRequestException(
        "Disable this employee component before removing it.",
      );
    }

    assignment.deletedAt = new Date();

    await this.assignments.save(assignment);

    return {
      message: "Employee component soft deleted. Historical records remain.",
    };
  }
}
