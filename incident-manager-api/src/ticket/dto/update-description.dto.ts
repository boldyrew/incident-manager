import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateDescriptionDto {
  @IsString()
  @IsOptional()
  @MaxLength(10000)
  description?: string;
}
