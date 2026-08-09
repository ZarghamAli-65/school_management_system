// dto/create-result.dto.ts
import {
  IsInt,
  IsOptional,
  IsString,
  IsEnum,
  Min,
  ValidateIf,
} from 'class-validator';
import { ResultType } from '@prisma/client';

export class CreateResultDto {
  @IsInt()
  @Min(1)
  studentId!: number;

  @IsInt()
  @Min(1)
  subjectId!: number;

  @IsInt()
  @Min(1)
  classId!: number;

  @IsInt()
  @Min(1)
  teacherId!: number;

  @IsEnum(ResultType)
  type!: ResultType;

  @IsOptional()
  @IsInt()
  @Min(1)
  examId?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  assignmentId?: number;

  @IsInt()
  @Min(0)
  obtainedMarks!: number;

  @IsOptional()
  @IsString()
  remarks?: string;
}