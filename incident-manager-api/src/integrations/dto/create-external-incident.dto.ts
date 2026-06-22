import { IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import { IncidentSeverity, IncidentType } from '@prisma/client';

export class CreateExternalIncidentDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(IncidentSeverity)
  severity: IncidentSeverity;

  @IsUUID()
  tenantId: string;

  @IsString()
  @IsOptional()
  sourceRef?: string;

  @IsEnum(IncidentType)
  @IsOptional()
  type?: IncidentType;
}
