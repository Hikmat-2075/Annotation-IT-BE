import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type AnnotatorsDocument = HydratedDocument<Annotators>;

@Schema({ timestamps: true, versionKey: false })
export class Annotators {
  @Prop({ required: true })
  _id: string; // staff_id_001

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  email: string;

  @prop
  @Prop({ type: [String], default: [] })
  completed_tasks: string[]; // trx_98765

  @Prop({ default: 0 })
  total_annotated: number;

  @Prop()
  last_login: Date;
}

export const AnnotatorsSchema = SchemaFactory.createForClass(Annotators);
