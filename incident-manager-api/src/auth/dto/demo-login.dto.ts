import { IsEnum } from 'class-validator';
import { UserRole } from '@prisma/client';

export class DemoLoginDto {
  @IsEnum(UserRole)
  role: UserRole;
}
