import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class UpdateTitleDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  title: string;
}
