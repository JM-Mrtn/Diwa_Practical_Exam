import { IsDateString, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiProperty, PartialType } from '@nestjs/swagger';

export class CreateEmployeeDto {
  @ApiProperty({ example: 'EMP-001' }) @IsString() @IsNotEmpty() @MaxLength(30) employeeId!: string;
  @ApiProperty({ example: 'Juan' }) @IsString() @IsNotEmpty() @MaxLength(100) firstName!: string;
  @ApiProperty({ example: 'Santos', required: false }) @IsOptional() @IsString() @MaxLength(100) middleName?: string;
  @ApiProperty({ example: 'Dela Cruz' }) @IsString() @IsNotEmpty() @MaxLength(100) lastName!: string;
  @ApiProperty({ example: '2026-11-23' }) @IsDateString() dateHired!: string;
}
export class UpdateEmployeeDto extends PartialType(CreateEmployeeDto) {}
