// dto/create-student.dto.ts
import { IsString, IsEmail, IsOptional, IsNumber, Min, Max } from 'class-validator';

export class CreateStudentDto {
  @IsString()
  studentId!: string;

  @IsString()
  name!: string;

  @IsEmail()
  email!: string;          // required (unique)

  @IsString()
  @IsOptional()
  photo?: string;        // optional

  @IsString()
  @IsOptional()
  phone?: string;        // optional

  @IsNumber()
  @Min(1)
  @Max(12)
  grade!: number;         // required – no ? here

  @IsString()
  address!: string;       // required

  // If you want to assign an existing class by its ID:
  @IsNumber()
  @IsOptional()
  classId?: number;     // optional – if not provided, class remains null


}