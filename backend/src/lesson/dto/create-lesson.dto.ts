import {
  IsInt,
  IsEnum,
  IsDateString,
} from 'class-validator';

enum Day {
  MONDAY = 'MONDAY',
  TUESDAY = 'TUESDAY',
  WEDNESDAY = 'WEDNESDAY',
  THURSDAY = 'THURSDAY',
  FRIDAY = 'FRIDAY',
  SATURDAY = 'SATURDAY',
}

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