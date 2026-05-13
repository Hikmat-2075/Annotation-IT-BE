import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { RelationType } from '../enums/relation-type.enum';

export type AnnotationsDocument = HydratedDocument<Annotations>;

@Schema({ _id: false })
class Bundle {
  @Prop({ required: true })
  bundle_id: string;

  @Prop({ type: [String], required: true })
  items: string[];

  @Prop({
    type: String,
    enum: RelationType,
    required: true,
  })
  relation_type: RelationType;

  @Prop()
  context: string;

  @Prop()
  reasoning: string;
}

export const BundleSchema = SchemaFactory.createForClass(Bundle);

@Schema({ timestamps: true, versionKey: false })
export class Annotations {
  @Prop({ required: true, index: true })
  transaction_id: string;

  @Prop({ required: true, index: true })
  annotator_id: string;

  @Prop({ type: [BundleSchema], default: [] })
  bundles: Bundle[];
}

export const AnnotationsSchema = SchemaFactory.createForClass(Annotations);
