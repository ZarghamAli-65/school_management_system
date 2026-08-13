import {
  IsInt,
  IsEnum,
  IsDateString,
} from 'class-validator';
import { Day } from '@prisma/client';

export class CreateLessonDto {
  @IsInt()
  subjectId!: number;

  @IsInt()
  classId!: number;

  @IsInt()
  teacherId!: number;

  @IsEnum(Day)
  day!: Day;

  @IsDateString()
  startTime!: string;

  @IsDateString()
  endTime!: string;
}