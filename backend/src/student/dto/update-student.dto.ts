// // dto/update-student.dto.ts
// import { PartialType } from '@nestjs/mapped-types';
// import { CreateStudentDto } from './create-student.dto';

// export class UpdateStudentDto extends PartialType(CreateStudentDto) {}



import { IsString, IsEmail, IsOptional, MinLength, IsNumber, Min, Max } from 'class-validator';

export class UpdateStudentDto {
  @IsOptional()
  @IsString()
  @MinLength(3)
  studentId?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  @MinLength(8)
  password?: string;

  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(12)
  grade?: number;

  @IsOptional()
  @IsNumber()
  classId?: number;

  @IsOptional()
  @IsString()
  photo?: string;
}