import {
  IsBoolean,
  IsDateString,
  IsEmail,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
} from 'class-validator';

import {
  EmploymentStatus,
  EmploymentType,
  Gender,
  MaritalStatus,
} from '@prisma/client';

export class CreateTeacherDto {
  @IsString()
  teacherId!: string;

  @IsString()
  @IsOptional()
  employeeId?: string;

  @IsEmail()
  email!: string;

  @IsString()
  @IsOptional()
  username?: string;

  @IsString()
  @IsOptional()
  password?: string;

  @IsString()
  @IsOptional()
  firstName?: string;

  @IsString()
  @IsOptional()
  lastName?: string;

  @IsString()
  @IsOptional()
  fatherHusbandName?: string;

  @IsString()
  @IsOptional()
  photo?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  alternatePhone?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  city?: string;

  @IsString()
  @IsOptional()
  state?: string;

  @IsString()
  @IsOptional()
  country?: string;

  @IsString()
  @IsOptional()
  postalCode?: string;

  @IsDateString()
  @IsOptional()
  dateOfBirth?: string;

  @IsEnum(Gender)
  @IsOptional()
  gender?: Gender;

  @IsEnum(MaritalStatus)
  @IsOptional()
  maritalStatus?: MaritalStatus;

  @IsString()
  @IsOptional()
  bloodType?: string;

  @IsString()
  @IsOptional()
  nationality?: string;

  @IsString()
  @IsOptional()
  nationalId?: string;

  @IsString()
  @IsOptional()
  passportNo?: string;

  @IsDateString()
  @IsOptional()
  joiningDate?: string;

  @IsEnum(EmploymentType)
  @IsOptional()
  employmentType?: EmploymentType;

  @IsEnum(EmploymentStatus)
  @IsOptional()
  employmentStatus?: EmploymentStatus;

  @IsString()
  @IsOptional()
  designation?: string;

  @IsString()
  @IsOptional()
  latestQualification?: string;

  @IsString()
  @IsOptional()
  specialization?: string;

  @IsInt()
  @IsOptional()
  experienceYears?: number;

  @IsString()
  @IsOptional()
  experienceField?: string;

  @IsString()
  @IsOptional()
  bio?: string;

  @IsString()
  @IsOptional()
  emergencyContactName?: string;

  @IsString()
  @IsOptional()
  emergencyContactPhone?: string;

  @IsString()
  @IsOptional()
  emergencyContactRelation?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}