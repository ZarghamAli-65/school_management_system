// dto/create-event.dto.ts
import {
  IsString,
  IsOptional,
  IsInt,
  IsDateString,
  Min,
} from 'class-validator';

export class CreateEventDto {
  @IsString()
  title!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  classId?: number;

  @IsDateString()
  eventDate!: string; // ISO date string

  @IsDateString()
  startTime!: string; // ISO datetime

  @IsDateString()
  endTime!: string; // ISO datetime

  @IsOptional()
  @IsString()
  venue?: string;
}