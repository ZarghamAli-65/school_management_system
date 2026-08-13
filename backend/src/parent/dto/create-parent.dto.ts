import {
  IsString,
  IsEmail,
  IsOptional,
  MinLength,
  MaxLength,
  IsEnum,
  IsDateString,
} from 'class-validator';

import { Gender, MaritalStatus } from '@prisma/client';

export class CreateParentDto {
  // Account
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(20)
  username?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  @MinLength(8)
  password?: string;

  // Personal Information
  @IsString()
  firstName!: string;

  @IsString()
  lastName!: string;

  @IsOptional()
  @IsString()
  photo?: string;

  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;

  @IsOptional()
  @IsString()
  bloodType?: string;

  @IsOptional()
  @IsString()
  nationality?: string;

  @IsOptional()
  @IsEnum(MaritalStatus)
  maritalStatus?: MaritalStatus;

  // Contact Information
  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  alternatePhone?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  province?: string;

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsString()
  postalCode?: string;

  // Identification
  @IsOptional()
  @IsString()
  @MinLength(13)
  @MaxLength(15)
  cnic?: string;

  // Education
  @IsOptional()
  @IsString()
  qualification?: string;

  // Professional Information
  @IsOptional()
  @IsString()
  occupation?: string;

  @IsOptional()
  @IsString()
  employer?: string;

  @IsOptional()
  @IsString()
  jobTitle?: string;
}