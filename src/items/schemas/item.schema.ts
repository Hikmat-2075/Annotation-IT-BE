import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ItemsDocument = HydratedDocument<Items>;

@Schema({ _id: false, strict: false })
class ItemAttributes {
  @Prop()
  name?: string;

  @Prop()
  brand?: string;

  @Prop()
  category?: string;

  @Prop()
  price?: number;

  @Prop()
  original_price?: number;

  @Prop()
  discount_amount?: number;

  @Prop()
  rating?: number;

  @Prop()
  review_count?: number;

  @Prop()
  sold_count?: number;

  @Prop()
  image_url?: string;

  @Prop()
  description?: string;

  @Prop({ type: Object, default: {} })
  specifications?: Record<string, any>;

  @Prop({ type: [String], default: [] })
  tags?: string[];

  @Prop()
  origin?: string;
}

const ItemAttributesSchema = SchemaFactory.createForClass(ItemAttributes);

@Schema({
  timestamps: true,
  versionKey: false,
  collection: 'items',
})
export class Items {
  @Prop({ type: String, required: true })
  _id: string;

  @Prop({ type: ItemAttributesSchema, required: true })
  attributes: ItemAttributes;
}

export const ItemsSchema = SchemaFactory.createForClass(Items);
