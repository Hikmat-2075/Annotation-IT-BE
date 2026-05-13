import { v4 as uuidv4 } from 'uuid';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ItemsDocument = HydratedDocument<Items>;

// 1. Definisikan isi attributes sebagai sub-schema
@Schema({ _id: false }) // _id: false agar sub-objek ini tidak punya ID sendiri
class ItemAttributes {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  brand: string;

  @Prop({ required: true })
  category: string;

  @Prop({ required: true })
  price: number;

  @Prop()
  image_url?: string;

  @Prop()
  description: string;

  @Prop()
  origin?: string;
}

// Buat skema untuk ItemAttributes agar bisa dipakai sebagai tipe data @Prop
const ItemAttributesSchema = SchemaFactory.createForClass(ItemAttributes);

// 2. Schema Utama
@Schema({ timestamps: true, versionKey: false })
export class Items {
  @Prop({ required: true, default: uuidv4 })
  _id: string;

  // Gunakan schema yang sudah dibuat di atas
  @Prop({ type: ItemAttributesSchema, required: true })
  attributes: ItemAttributes;
}

export const ItemsSchema = SchemaFactory.createForClass(Items);
