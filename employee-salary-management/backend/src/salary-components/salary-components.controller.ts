import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from "@nestjs/common";

import { ApiTags } from "@nestjs/swagger";

import { SalaryComponentsService } from "./salary-components.service";

import {
  AssignComponentDto,
  CreateComponentDto,
  UpdateAssignedAmountDto,
  UpdateComponentDto,
} from "./dto/component.dto";

@ApiTags("3. Salary Components")
@Controller()
export class SalaryComponentsController {
  constructor(private readonly service: SalaryComponentsService) {}

  // ==================================
  // COMPONENT CATALOG
  // ==================================

  @Get("salary-components")
  catalog() {
    return this.service.listCatalog();
  }

  @Post("salary-components")
  create(@Body() dto: CreateComponentDto) {
    return this.service.createCatalog(dto);
  }

  @Patch("salary-components/:id")
  rename(
    @Param("id", ParseIntPipe) id: number,
    @Body() dto: UpdateComponentDto,
  ) {
    return this.service.renameCatalog(id, dto);
  }

  // Disable catalog component
  @Patch("salary-components/:id/disable")
  disableCatalog(@Param("id", ParseIntPipe) id: number) {
    return this.service.disableCatalog(id);
  }

  // Enable catalog component
  @Patch("salary-components/:id/enable")
  enableCatalog(@Param("id", ParseIntPipe) id: number) {
    return this.service.enableCatalog(id);
  }

  // Soft delete catalog component
  @Delete("salary-components/:id")
  delete(@Param("id", ParseIntPipe) id: number) {
    return this.service.softDeleteCatalog(id);
  }

  // ==================================
  // EMPLOYEE COMPONENT ASSIGNMENTS
  // ==================================

  @Get("employees/:employeeId/components")
  list(@Param("employeeId", ParseIntPipe) employeeId: number) {
    return this.service.listForEmployee(employeeId);
  }

  @Post("employees/:employeeId/components")
  assign(
    @Param("employeeId", ParseIntPipe) employeeId: number,
    @Body() dto: AssignComponentDto,
  ) {
    return this.service.assign(employeeId, dto);
  }

  @Patch("employees/:employeeId/components/:assignedId")
  change(
    @Param("employeeId", ParseIntPipe) employeeId: number,
    @Param("assignedId", ParseIntPipe) assignedId: number,
    @Body() dto: UpdateAssignedAmountDto,
  ) {
    return this.service.changeAmount(employeeId, assignedId, dto);
  }

  // Disable one employee assignment
  @Patch("employees/:employeeId/components/:assignedId/disable")
  disableAssignment(
    @Param("employeeId", ParseIntPipe) employeeId: number,
    @Param("assignedId", ParseIntPipe) assignedId: number,
  ) {
    return this.service.disableAssignment(employeeId, assignedId);
  }

  // Enable one employee assignment
  @Patch("employees/:employeeId/components/:assignedId/enable")
  enableAssignment(
    @Param("employeeId", ParseIntPipe) employeeId: number,
    @Param("assignedId", ParseIntPipe) assignedId: number,
  ) {
    return this.service.enableAssignment(employeeId, assignedId);
  }

  // Soft delete one employee assignment
  @Delete("employees/:employeeId/components/:assignedId")
  remove(
    @Param("employeeId", ParseIntPipe) employeeId: number,
    @Param("assignedId", ParseIntPipe) assignedId: number,
  ) {
    return this.service.remove(employeeId, assignedId);
  }
}
