import {
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
} from 'class-validator';
import { TeacherAttendanceStatus } from '@prisma/client';

export class MarkTeacherAttendanceDto {
  @IsInt()
  teacherId!: number;

  @IsDateString()
  date!: string;

  @IsEnum(TeacherAttendanceStatus)
  status!: TeacherAttendanceStatus;

  @IsOptional()
  @IsString()
  remarks?: string;
}