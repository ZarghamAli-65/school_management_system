import {
  IsArray,
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  ValidateNested,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';
import { StudentAttendanceStatus } from '@prisma/client';

class StudentAttendanceItemDto {
  @IsInt()
  studentId!: number;

  @IsEnum(StudentAttendanceStatus)
  status!: StudentAttendanceStatus;

  @IsOptional()
  @IsString()
  remarks?: string;
}

export class MarkStudentAttendanceDto {
  @IsInt()
  classId!: number;

  @IsDateString()
  date!: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StudentAttendanceItemDto)
  students!: StudentAttendanceItemDto[];
}