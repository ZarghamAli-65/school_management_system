import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export enum ExamStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export class CreateExamDto {
  @IsString()
  @IsNotEmpty()
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
  examDate!: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  durationMinutes?: number;

  @IsInt()
  @Min(1)
  totalMarks!: number;

  @IsInt()
  @Min(1)
  passingMarks!: number;

  @IsOptional()
  @IsEnum(ExamStatus)
  status?: ExamStatus;
}