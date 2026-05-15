import { IsOptional, IsUUID, ValidateIf } from 'class-validator';

export class LinkIncidentDto {
  @ValidateIf((_, value) => value !== null)
  @IsUUID()
  @IsOptional()
  incidentId: string | null;
}
