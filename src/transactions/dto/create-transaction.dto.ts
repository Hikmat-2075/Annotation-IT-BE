import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TransactionStatus } from '../enums/transaction-status.enum';

class TransactionInteractionItemDto {
  @ApiProperty({ example: 1 })
  @IsNumber()
  order_number: number;

  @ApiProperty({ example: 1718179200 })
  @IsNumber()
  timestamp: number;

  @ApiPropertyOptional({ example: 5, nullable: true })
  @IsOptional()
  @IsNumber()
  rating?: number | null;

  @ApiPropertyOptional({
    type: 'object',
    additionalProperties: true,
    example: { quantity: 1 },
  })
  @IsOptional()
  @IsObject()
  attributes?: Record<string, any>;
}

export class CreateTransactionDto {
  @ApiProperty({ example: 'trx_0001' })
  @IsString()
  @IsNotEmpty()
  _id: string;

  @ApiProperty({ example: 'user_0001' })
  @IsString()
  @IsNotEmpty()
  user_id: string;

  @ApiPropertyOptional({
    enum: TransactionStatus,
    example: TransactionStatus.AVAILABLE,
  })
  @IsOptional()
  @IsEnum(TransactionStatus)
  status?: TransactionStatus;

  @ApiPropertyOptional({ example: null, nullable: true })
  @IsOptional()
  @IsString()
  assigned_by?: string | null;

  @ApiPropertyOptional({ example: null, nullable: true })
  @IsOptional()
  @IsDateString()
  assigned_at?: string | null;

  @ApiPropertyOptional({ example: null, nullable: true })
  @IsOptional()
  @IsDateString()
  annotated_at?: string | null;

  @ApiProperty({
    type: 'object',
    additionalProperties: {
      $ref: '#/components/schemas/TransactionInteractionItemDto',
    },
    example: {
      item_0001: {
        order_number: 1,
        timestamp: 1718179200,
        rating: null,
        attributes: {},
      },
    },
  })
  @IsObject()
  list_of_interaction_items: Record<string, TransactionInteractionItemDto>;
}
