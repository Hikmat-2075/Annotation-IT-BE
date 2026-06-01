import { IsOptional, IsString, IsEnum } from 'class-validator';
import { TransactionStatus } from '../enums/transaction-status.enum';

export class TransactionQueryDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(TransactionStatus)
  status?: TransactionStatus;

  @IsOptional()
  @IsString()
  user_id?: string;

  @IsOptional()
  @IsString()
  item_id?: string;

  @IsOptional()
  @IsString()
  assigned_by?: string;

  @IsOptional()
  @IsString()
  page?: string;

  @IsOptional()
  @IsString()
  limit?: string;
}
