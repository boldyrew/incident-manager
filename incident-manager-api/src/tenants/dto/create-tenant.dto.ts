import { IsString, IsNotEmpty, IsEnum, IsOptional } from 'class-validator';
import { TenantTier, TenantStatus } from '@prisma/client';

export class CreateTenantDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  alias: string;

  @IsString()
  @IsOptional()
  industry?: string;

  @IsEnum(TenantTier)
  @IsOptional()
  tier?: TenantTier;

  @IsEnum(TenantStatus)
  @IsOptional()
  status?: TenantStatus;
}
