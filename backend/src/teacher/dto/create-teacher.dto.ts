import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  IsDateString,
} from 'class-validator';

enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
}

export class CreateTeacherDto {
  @IsString()
  teacherId!: string;

  @IsString()
  username!: string;

  @IsEmail()
  email!: string;

  @IsString()
  firstName!: string;

  @IsString()
  lastName!: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  bloodType!: string;

  @IsDateString()
  birthday!: string;

  @IsEnum(Gender)
  gender!: Gender;

  @IsString()
  @IsOptional()
  photo?: string;
}