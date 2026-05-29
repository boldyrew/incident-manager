import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateDescriptionDto {
  @IsOptional()
  @IsString()
  @MaxLength(10000)
  description?: string;
}
