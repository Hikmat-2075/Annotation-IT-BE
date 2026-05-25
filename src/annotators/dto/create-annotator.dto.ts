import {
  IsString,
  IsEmail,
  IsEnum,
  IsInt,
  IsNotEmpty,
  MaxLength,
  Min,
  MinLength,
  IsOptional,
  IsArray,
  IsNumber,
  IsDateString,
  IsUrl,
} from 'class-validator';
import { Gender } from '../schema/annotators.schema';

export class CreateAnnotatorDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsEnum(Gender)
  gender: Gender;

  @IsInt()
  @Min(1)
  age: number;

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  password: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  completed_tasks?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  current_batch?: string[];

  @IsOptional()
  @IsNumber()
  total_annotated?: number;

  @IsOptional()
  @IsDateString()
  last_login?: string;

  @IsOptional()
  @IsUrl()
  profile_uri?: string;
}
