import { Type } from 'class-transformer';
import { IsBoolean, IsInt, IsOptional } from 'class-validator';

export class CreateTeacherClassDto {
  @Type(() => Number)
  @IsInt()
  teacherId!: number;

  @Type(() => Number)
  @IsInt()
  classId!: number;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isClassTeacher?: boolean;
}