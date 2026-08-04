// import {
//   IsString,
//   IsEmail,
//   IsOptional,
//   MinLength,
//   MaxLength,
//   IsEnum,
// } from 'class-validator';
// import { Gender } from '@prisma/client'; // or your local enum file

// export class CreateParentDto {
//   @IsString()
//   @MinLength(3)
//   @MaxLength(20)
//   username!: string;

//   @IsEmail()
//   email!: string;

//   @IsString()
//   @MinLength(8)
//   password!: string;

//   @IsString()
//   firstName!: string;

//   @IsString()
//   lastName!: string;

//   @IsOptional()
//   @IsString()
//   phone?: string;

//   @IsOptional()
//   @IsString()
//   address?: string;

//   @IsOptional()
//   @IsString()
//   bloodType?: string;

//   @IsOptional()
//   @IsEnum(Gender)
//   gender?: Gender;

//   @IsOptional()
//   @IsString()
//   image?: string;
// }


import {
  IsString,
  IsEmail,
  IsOptional,
  MinLength,
  MaxLength,
  IsIn,
} from 'class-validator';

export class CreateParentDto {
  @IsString()
  @MinLength(3)
  @MaxLength(20)
  username!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  password!: string;

  @IsString()
  firstName!: string;

  @IsString()
  lastName!: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  bloodType?: string;

  @IsOptional()
  @IsIn(['MALE', 'FEMALE', 'OTHER'])
  gender?: 'MALE' | 'FEMALE' | 'OTHER';

  @IsOptional()
  @IsString()
  image?: string;
}