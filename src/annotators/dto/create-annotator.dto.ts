import {
  IsString,
  IsEmail,
  IsOptional,
  IsArray,
  IsNumber,
  MinLength,
  MaxLength,
  IsUrl,
} from 'class-validator';

export class CreateAnnotatorDto {
  @IsString()
  @MaxLength(100)
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  @MaxLength(100)
  password: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  completed_tasks?: string[];

  @IsOptional()
  @IsNumber()
  total_annotated?: number;

  @IsOptional()
  last_login?: Date;

  @IsOptional()
  @IsUrl()
  profile_uri?: string;
}
