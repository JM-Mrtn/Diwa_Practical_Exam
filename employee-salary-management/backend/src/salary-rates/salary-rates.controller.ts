import { Controller, Get, Param, ParseIntPipe } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { SalaryRatesService } from "./salary-rates.service";
@ApiTags("4. Salary Rate Computation")
@Controller("salary-rates")
export class SalaryRatesController {
  constructor(private readonly service: SalaryRatesService) {}
  @Get(":employeeId") compute(
    @Param("employeeId", ParseIntPipe) employeeId: number,
  ) {
    return this.service.compute(employeeId);
  }
}
