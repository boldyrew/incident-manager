import { IsString, IsNotEmpty, IsEnum, IsOptional, IsDateString, IsUUID } from 'class-validator';
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

  @IsUUID()
  @IsOptional()
  assignedUserId?: string | null;

  @IsDateString()
  detectedAt: string;
}
