import { IsString, IsNotEmpty, IsEnum, IsOptional, IsDateString } from 'class-validator';
import { IncidentSeverity, IncidentStatus } from '@prisma/client';

export class CreateIncidentDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(IncidentSeverity)
  severity: IncidentSeverity;

  @IsEnum(IncidentStatus)
  status: IncidentStatus;

  @IsString()
  @IsNotEmpty()
  client: string;

  @IsString()
  @IsOptional()
  assignedTo?: string;

  @IsDateString()
  detectedAt: string;
}
