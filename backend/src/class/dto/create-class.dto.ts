import {
  IsString,
  IsInt,
  Min,
  Max,
  IsOptional,
  IsBoolean,
} from "class-validator";

export class CreateClassDto {
  @IsOptional()
  @IsString()
  section?: string;

  @IsInt()
  @Min(1)
  @Max(12)
  grade!: number;

  @IsOptional()
  @IsString()
  academicYear?: string;

  @IsOptional()
  @IsString()
  roomNo?: string;

  @IsInt()
  @Min(1)
  capacity!: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  enrolledCount?: number;

  @IsOptional()
  @IsString()
  supervisor?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}