import { IsEnum, IsNotEmpty } from 'class-validator';
import { IncidentSeverity } from '@prisma/client';

export class SetSeverityDto {
  @IsEnum(IncidentSeverity)
  @IsNotEmpty()
  severity: IncidentSeverity;
}
