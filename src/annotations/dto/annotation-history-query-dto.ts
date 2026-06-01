import { IsEnum, IsOptional, IsString } from 'class-validator';
import { RelationType } from '../enums/relation-type.enum';

export class AnnotationHistoryQueryDto {
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
