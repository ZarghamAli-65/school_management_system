import { IsEmail, IsOptional, IsString } from 'class-validator';

export class CreateTeacherDto {
  @IsString()
  teacherId!: string;

  @IsString()
  name!: string;

  @IsEmail()
  email!: string;

  @IsOptional()
  @IsString()
  photo?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  address?: string;
}