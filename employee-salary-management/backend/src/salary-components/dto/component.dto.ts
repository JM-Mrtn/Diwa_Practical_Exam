import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsNumber, IsString, MaxLength, Min } from 'class-validator';

export class CreateComponentDto {
  @ApiProperty({ example: 'Transportation Allowance' })
  @IsString() @IsNotEmpty() @MaxLength(120) name!: string;
}
export class UpdateComponentDto extends PartialType(CreateComponentDto) {}
export class AssignComponentDto {
  @ApiProperty({ example: 1 }) @IsInt() @Min(1) componentId!: number;
  @ApiProperty({ example: 1500 }) @IsNumber({ maxDecimalPlaces: 2 }) @Min(0) amount!: number;
}
export class UpdateAssignedAmountDto {
  @ApiProperty({ example: 2500 }) @IsNumber({ maxDecimalPlaces: 2 }) @Min(0) amount!: number;
}
