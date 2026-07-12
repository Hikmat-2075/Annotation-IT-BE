import {
  IsString,
  IsNumber,
  IsOptional,
  IsObject,
  IsArray,
  IsNotEmpty,
  Min,
  IsUrl,
  IsPositive,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class SpecificationsDto {
  @ApiPropertyOptional({ example: '500g' })
  @IsOptional()
  @IsString({ message: 'Weight harus berupa string' })
  weight?: string;

  @ApiPropertyOptional({ example: 'medium' })
  @IsOptional()
  @IsString({ message: 'Roast level harus berupa string' })
  roast_level?: string;

  [key: string]: any;
}

class AttributesDto {
  @ApiProperty({ example: 'Kopi Arabika' })
  @IsString({ message: 'Nama produk wajib berupa string' })
  @IsNotEmpty({ message: 'Nama produk tidak boleh kosong' })
  name: string;

  @ApiProperty({ example: 'Miyako' })
  @IsString({ message: 'Brand wajib berupa string' })
  @IsNotEmpty({ message: 'Brand tidak boleh kosong' })
  brand: string;

  @ApiProperty({ example: 'Food & Beverage' })
  @IsString({ message: 'Kategori wajib berupa string' })
  @IsNotEmpty({ message: 'Kategori tidak boleh kosong' })
  category: string;

  @ApiProperty({ example: 25000 })
  @IsNumber({}, { message: 'Harga harus berupa angka' })
  @IsPositive({ message: 'Harga harus lebih dari 0' })
  @Type(() => Number)
  price: number;

  @ApiPropertyOptional({ example: 30000 })
  @IsOptional()
  @IsNumber({}, { message: 'Original price harus berupa angka' })
  @Type(() => Number)
  original_price?: number;

  @ApiPropertyOptional({ example: 5000 })
  @IsOptional()
  @IsNumber({}, { message: 'Discount amount harus berupa angka' })
  @Type(() => Number)
  discount_amount?: number;

  @ApiPropertyOptional({ example: 4.8 })
  @IsOptional()
  @IsNumber({}, { message: 'Rating harus berupa angka' })
  @Min(0, { message: 'Rating minimal 0' })
  @Type(() => Number)
  rating?: number;

  @ApiPropertyOptional({ example: 120 })
  @IsOptional()
  @IsNumber({}, { message: 'Review count harus berupa angka' })
  @Min(0, { message: 'Review count minimal 0' })
  @Type(() => Number)
  review_count?: number;

  @ApiPropertyOptional({ example: 300 })
  @IsOptional()
  @IsNumber({}, { message: 'Sold count harus berupa angka' })
  @Min(0, { message: 'Sold count minimal 0' })
  @Type(() => Number)
  sold_count?: number;

  @ApiPropertyOptional({ example: 'https://example.com/items/item_0001.jpg' })
  @IsOptional()
  @IsUrl({}, { message: 'Image URL harus berupa link yang valid' })
  image_url?: string;

  @ApiProperty({ example: 'Kopi Arabika berkualitas.' })
  @IsString({ message: 'Deskripsi wajib berupa string' })
  @IsNotEmpty({ message: 'Deskripsi tidak boleh kosong' })
  description: string;

  @ApiProperty({
    type: SpecificationsDto,
    example: { weight: '500g', variant: 'family pack' },
  })
  @IsObject({ message: 'Specifications harus berupa object' })
  @Type(() => SpecificationsDto)
  specifications: Record<string, any>;

  @ApiPropertyOptional({ type: [String], example: ['food_beverage', 'kopi'] })
  @IsOptional()
  @IsArray({ message: 'Tags harus berupa array' })
  @IsString({ each: true, message: 'Setiap tag harus string' })
  tags?: string[];

  @ApiPropertyOptional({ example: 'Indonesia' })
  @IsOptional()
  @IsString({ message: 'Origin harus berupa string' })
  origin?: string;
}

export class CreateItemDto {
  @ApiProperty({ example: 'item_0001' })
  @IsString({ message: '_id harus berupa string' })
  @IsNotEmpty({ message: '_id tidak boleh kosong' })
  _id: string;

  @ApiProperty({ type: AttributesDto })
  @IsObject({ message: 'Attributes wajib berupa object' })
  @ValidateNested()
  @Type(() => AttributesDto)
  attributes: AttributesDto;
}
