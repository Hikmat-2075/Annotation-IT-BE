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
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { RelationType } from '../enums/relation-type.enum';
import { CorrelationStatus } from '../enums/correlation-status.enum';

export class SubmitBundleDto {
  @ApiProperty({ type: [String], example: ['item_0001', 'item_0002'] })
  @IsArray()
  @ArrayMinSize(2)
  @IsString({ each: true })
  items: string[];

  @ApiProperty({
    enum: CorrelationStatus,
    example: CorrelationStatus.CORRELATED,
  })
  @IsEnum(CorrelationStatus)
  correlation_status: CorrelationStatus;

  @ApiPropertyOptional({ enum: RelationType, example: RelationType.SIMILARITY })
  @IsOptional()
  @IsEnum(RelationType)
  relation_type: RelationType | null;

  @ApiPropertyOptional({ example: 'Produk sering dibeli bersama.' })
  @IsOptional()
  @IsString()
  context?: string | null;

  @ApiProperty({ example: 'Kedua item memiliki fungsi yang saling terkait.' })
  @IsString()
  @MinLength(5)
  reasoning: string;
}

export class SubmitAnnotationDto {
  @ApiProperty({ example: 'trx_0001' })
  @IsString()
  @IsNotEmpty()
  transaction_id: string;

  @ApiProperty({ type: [SubmitBundleDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => SubmitBundleDto)
  bundles: SubmitBundleDto[];
}
