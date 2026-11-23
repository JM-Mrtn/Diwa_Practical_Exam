import { Body, Controller, Get, Param, ParseIntPipe, Put } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SalariesService } from './salaries.service';
import { AssignSalaryDto } from './dto/assign-salary.dto';
@ApiTags('2. Salary Assignment')
@Controller('salaries')
export class SalariesController {
  constructor(private readonly service: SalariesService) {}
  @Get(':employeeId') find(@Param('employeeId', ParseIntPipe) employeeId: number) { return this.service.findForEmployee(employeeId); }
  @Put(':employeeId') upsert(@Param('employeeId', ParseIntPipe) employeeId: number, @Body() dto: AssignSalaryDto) { return this.service.assign(employeeId, dto); }
}
