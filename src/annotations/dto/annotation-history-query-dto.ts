import {
  IsDateString,
  IsEnum,
  IsIn,
  IsOptional,
  IsString,
} from 'class-validator';
import { ApiPropertyOptional, OmitType } from '@nestjs/swagger';
import { RelationType } from '../enums/relation-type.enum';
import { CorrelationStatus } from '../enums/correlation-status.enum';

export class AnnotationHistoryQueryDto {
  @ApiPropertyOptional({ example: 'kopi' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ example: 'trx_0001' })
  @IsOptional()
  @IsString()
  transaction_id?: string;

  @ApiPropertyOptional({ example: 'annotator_0001' })
  @IsOptional()
  @IsString()
  annotator_id?: string;

  @ApiPropertyOptional({ enum: RelationType })
  @IsOptional()
  @IsEnum(RelationType)
  relation_type?: RelationType;

  @ApiPropertyOptional({ enum: CorrelationStatus })
  @IsOptional()
  @IsEnum(CorrelationStatus)
  correlation_status?: CorrelationStatus;

  @ApiPropertyOptional({ example: '2026-01-01' })
  @IsOptional()
  @IsDateString()
  from?: string;

  @ApiPropertyOptional({ example: '2026-12-31' })
  @IsOptional()
  @IsDateString()
  to?: string;

  @ApiPropertyOptional({ example: '1' })
  @IsOptional()
  @IsString()
  page?: string;

  @ApiPropertyOptional({ example: '10' })
  @IsOptional()
  @IsString()
  limit?: string;
}

export class AnnotationExportQueryDto extends AnnotationHistoryQueryDto {
  @ApiPropertyOptional({ enum: ['json', 'csv'], default: 'json' })
  @IsOptional()
  @IsIn(['json', 'csv'])
  format?: 'json' | 'csv';
}

export class AnnotationExportAllUsersQueryDto extends OmitType(
  AnnotationExportQueryDto,
  ['annotator_id'] as const,
) {}
