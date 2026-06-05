import { IsEnum, IsOptional, IsString } from 'class-validator';
import { RelationType } from '../enums/relation-type.enum';
import { CorrelationStatus } from '../enums/correlation-status.enum';

export class AnnotationHistoryQueryDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  transaction_id?: string;

  @IsOptional()
  @IsString()
  annotator_id?: string;

  @IsOptional()
  @IsEnum(RelationType)
  relation_type?: RelationType;

  @IsOptional()
  @IsEnum(CorrelationStatus)
  correlation_status?: CorrelationStatus;

  @IsOptional()
  @IsString()
  from?: string;

  @IsOptional()
  @IsString()
  to?: string;

  @IsOptional()
  @IsString()
  page?: string;

  @IsOptional()
  @IsString()
  limit?: string;
}
