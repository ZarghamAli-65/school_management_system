// dto/create-assignment.dto.ts
import { IsString, IsOptional, IsInt, IsDateString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateAssignmentDto {
  @IsString()
  title!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsInt()
  @Min(1)
  subjectId!: number;

  @IsInt()
  @Min(1)
  classId!: number;

  @IsInt()
  @Min(1)
  teacherId!: number;

  @IsDateString()
  dueDate!: string; // ISO date string
}