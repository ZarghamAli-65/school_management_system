import {
  IsString,
  IsEmail,
  IsOptional,
  IsInt,
  IsEnum,
  IsDateString,
} from 'class-validator';

enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  OTHER = 'OTHER',
}

enum GuardianRelation {
  FATHER = 'FATHER',
  MOTHER = 'MOTHER',
  GUARDIAN = 'GUARDIAN',
  OTHER = 'OTHER',
}

enum StudentStatus {
  ACTIVE = 'ACTIVE',
  GRADUATED = 'GRADUATED',
  TRANSFERRED = 'TRANSFERRED',
  WITHDRAWN = 'WITHDRAWN',
  SUSPENDED = 'SUSPENDED',
}

export class CreateStudentDto {
  // Authentication
  @IsString()
  studentId!: string;

  @IsOptional()
  @IsString()
  username?: string;

  @IsEmail()
  email!: string;

  @IsString()
  password!: string;

  // Personal
  @IsString()
  firstName!: string;

  @IsString()
  lastName!: string;

  @IsString()
  fatherName!: string;

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
  placeOfBirth?: string;

  @IsOptional()
  @IsString()
  nationality?: string;

  @IsOptional()
  @IsString()
  religion?: string;

  @IsOptional()
  @IsString()
  language?: string;

  // Contact
  @IsOptional()
  @IsString()
  street?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  province?: string;

  @IsOptional()
  @IsString()
  postalCode?: string;

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  photo?: string;

  // Emergency Contact
  @IsOptional()
  @IsString()
  emergencyContactName?: string;

  @IsOptional()
  @IsString()
  emergencyContactPhone?: string;

  @IsOptional()
  @IsString()
  emergencyContactRelation?: string;

  // Guardian
  @IsOptional()
  @IsEnum(GuardianRelation)
  guardianRelation?: GuardianRelation;

  // Academic
  @IsOptional()
  @IsInt()
  classId?: number;

  @IsOptional()
  @IsString()
  section?: string;

  @IsOptional()
  @IsInt()
  rollNumber?: number;

  @IsOptional()
  @IsString()
  academicYear?: string;

  // Enrollment
  @IsOptional()
  @IsDateString()
  enrollmentDate?: string;

  @IsOptional()
  @IsInt()
  admissionYear?: number;

  @IsOptional()
  @IsString()
  previousSchool?: string;

  @IsOptional()
  @IsEnum(StudentStatus)
  status?: StudentStatus;

  // Parent
  @IsOptional()
  @IsInt()
  parentId?: number;
}