import { v4 as uuidv4 } from 'uuid';

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { HydratedDocument } from 'mongoose';

export type AnnotatorsDocument = HydratedDocument<Annotators>;

@Schema({
  timestamps: true,
  versionKey: false,
})
export class Annotators {
  @Prop({
    required: true,
    default: uuidv4,
  })
  _id: string;

  @Prop({ required: true })
  name: string;

  @Prop({
    required: true,
    unique: true,
  })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({
    type: [String],
    default: [],
  })
  completed_tasks: string[];

  @Prop({ default: 0 })
  total_annotated: number;

  @Prop()
  last_login?: Date;
}

export const AnnotatorsSchema = SchemaFactory.createForClass(Annotators);
