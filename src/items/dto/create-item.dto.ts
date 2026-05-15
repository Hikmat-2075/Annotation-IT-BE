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
} from 'class-validator';
import { Type } from 'class-transformer';

class SpecificationsDto {
  @IsOptional()
  @IsString({ message: 'Weight harus berupa string' })
  weight?: string;

  @IsOptional()
  @IsString({ message: 'Roast level harus berupa string' })
  roast_level?: string;

  // fleksibel untuk field lain
  [key: string]: any;
}

class AttributesDto {
  @IsString({ message: 'Nama produk wajib berupa string' })
  @IsNotEmpty({ message: 'Nama produk tidak boleh kosong' })
  name: string;

  @IsString({ message: 'Brand wajib berupa string' })
  @IsNotEmpty({ message: 'Brand tidak boleh kosong' })
  brand: string;

  @IsString({ message: 'Kategori wajib berupa string' })
  @IsNotEmpty({ message: 'Kategori tidak boleh kosong' })
  category: string;

  @IsNumber({}, { message: 'Harga harus berupa angka' })
  @IsPositive({ message: 'Harga harus lebih dari 0' })
  @Type(() => Number)
  price: number;

  @IsOptional()
  @IsNumber({}, { message: 'Original price harus berupa angka' })
  @Type(() => Number)
  original_price?: number;

  @IsOptional()
  @IsNumber({}, { message: 'Discount amount harus berupa angka' })
  @Type(() => Number)
  discount_amount?: number;

  @IsOptional()
  @IsNumber({}, { message: 'Rating harus berupa angka' })
  @Min(0, { message: 'Rating minimal 0' })
  @Type(() => Number)
  rating?: number;

  @IsOptional()
  @IsNumber({}, { message: 'Review count harus berupa angka' })
  @Min(0, { message: 'Review count minimal 0' })
  @Type(() => Number)
  review_count?: number;

  @IsOptional()
  @IsNumber({}, { message: 'Sold count harus berupa angka' })
  @Min(0, { message: 'Sold count minimal 0' })
  @Type(() => Number)
  sold_count?: number;

  @IsOptional()
  @IsUrl({}, { message: 'Image URL harus berupa link yang valid' })
  image_url?: string;

  @IsString({ message: 'Deskripsi wajib berupa string' })
  @IsNotEmpty({ message: 'Deskripsi tidak boleh kosong' })
  description: string;

  @IsObject({ message: 'Specifications harus berupa object' })
  @Type(() => SpecificationsDto)
  specifications: Record<string, any>;

  @IsOptional()
  @IsArray({ message: 'Tags harus berupa array' })
  @IsString({ each: true, message: 'Setiap tag harus string' })
  tags?: string[];

  @IsOptional()
  @IsString({ message: 'Origin harus berupa string' })
  origin?: string;
}

export class CreateItemDto {
  @IsOptional()
  @IsString({ message: '_id harus berupa string' })
  _id?: string;

  @IsObject({ message: 'Attributes wajib berupa object' })
  @Type(() => AttributesDto)
  attributes: AttributesDto;
}
