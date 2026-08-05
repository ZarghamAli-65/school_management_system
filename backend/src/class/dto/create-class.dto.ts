// src/classes/dto/create-class.dto.ts
import { IsString, IsInt, Min, Max, IsOptional } from 'class-validator';

export class CreateClassDto {
  @IsString()
  name!: string;

  @IsInt()
  @Min(1)
  capacity!: number;

  @IsInt()
  @Min(1)
  @Max(12) // assuming grade 1–12
  grade!: number;

  @IsString()
  supervisor!: string;

  // Optional relations – you can accept arrays of IDs to connect
  @IsOptional()
  @IsInt({ each: true })
  studentIds?: number[];

  @IsOptional()
  @IsInt({ each: true })
  teacherIds?: number[];

  @IsOptional()
  @IsInt({ each: true })
  lessonIds?: number[];

  // ... add other relation IDs as needed
}
