import {
  IsString,
  IsEmail,
  IsOptional,
  IsArray,
  IsNumber,
  MaxLength,
} from 'class-validator';

export class UpdateAnnotatorDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  completed_tasks?: string[];

  @IsOptional()
  @IsNumber()
  total_annotated?: number;
}
