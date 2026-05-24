import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type TransactionsDocument = HydratedDocument<Transactions>;

@Schema({ _id: false })
class InteractionItem {
  @Prop({ required: true })
  order_number: number;

  @Prop({ required: true })
  timestamp: number;

  @Prop({ type: Number, default: null })
  rating: number | null;

  @Prop({ type: Object, default: {} })
  attributes: Record<string, any>;
}

export const InteractionItemSchema =
  SchemaFactory.createForClass(InteractionItem);

@Schema({
  collection: 'transactions',
  timestamps: true,
  versionKey: false,
})
export class Transactions {
  @Prop({ required: true })
  _id: string;

  @Prop({ required: true })
  user_id: string;

  @Prop({
    type: Map,
    of: InteractionItemSchema,
    required: true,
  })
  list_of_interaction_items: Map<string, InteractionItem>;
}

export const TransactionsSchema = SchemaFactory.createForClass(Transactions);
