import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, Min } from 'class-validator';
export class AssignSalaryDto {
  @ApiProperty({ example: 25000, minimum: 0 })
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'Salary must be a number with at most two decimal places' })
  @Min(0) monthlyBasicSalary!: number;
}
