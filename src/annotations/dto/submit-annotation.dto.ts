import {
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { RelationType } from '../enums/relation-type.enum';
import { CorrelationStatus } from '../enums/correlation-status.enum';

export class SubmitBundleDto {
  @IsArray()
  @ArrayMinSize(2)
  @IsString({ each: true })
  items: string[];

  @IsEnum(CorrelationStatus)
  correlation_status: CorrelationStatus;

  @IsOptional()
  @IsEnum(RelationType)
  relation_type: RelationType | null;

  @IsOptional()
  @IsString()
  context?: string | null;

  @IsString()
  @MinLength(5)
  reasoning: string;
}

export class SubmitAnnotationDto {
  @IsString()
  @IsNotEmpty()
  transaction_id: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => SubmitBundleDto)
  bundles: SubmitBundleDto[];
}
