import { IsEnum, IsNotEmpty } from 'class-validator';
import { IncidentStatus } from '@prisma/client';

export class SetStatusDto {
  @IsEnum(IncidentStatus)
  @IsNotEmpty()
  status: IncidentStatus;
}
