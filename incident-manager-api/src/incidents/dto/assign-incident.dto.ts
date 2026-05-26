import { IsOptional, IsUUID } from 'class-validator';

export class AssignIncidentDto {
  @IsOptional()
  @IsUUID()
  userId?: string | null;
}
