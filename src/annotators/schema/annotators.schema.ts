import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type AnnotatorDocument = HydratedDocument<Annotator>;

export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
}

@Schema({ timestamps: true })
export class Annotator {
  @Prop({
    type: String,
    required: true,
  })
  _id: string;

  @Prop({ required: true, trim: true })
  name: string;

  @Prop({
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  })
  email: string;

  @Prop({
    required: true,
    enum: Gender,
  })
  gender: Gender;

  @Prop({
    required: true,
    min: 1,
  })
  age: number;

  @Prop({
    required: true,
    select: false,
  })
  password: string;

  @Prop({
    type: [String],
    default: [],
  })
  completed_tasks: string[];

  @Prop({
    type: [String],
    default: [],
  })
  current_batch: string[];

  @Prop({
    default: 0,
  })
  total_annotated: number;

  @Prop({
    default: 'https://example.com/default-profile.png',
  })
  profile_uri: string;

  @Prop({
    default: null,
  })
  last_login: Date;
}

export const AnnotatorSchema = SchemaFactory.createForClass(Annotator);
