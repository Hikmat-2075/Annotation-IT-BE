import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { RelationType } from '../enums/relation-type.enum';
import { CorrelationStatus } from '../enums/correlation-status.enum';

export type AnnotationsDocument = HydratedDocument<Annotations>;

@Schema({ _id: false })
class Bundle {
  @Prop({ required: true })
  bundle_id: string;

  @Prop({
    type: [String],
    required: true,
    validate: {
      validator: (items: string[]) => items.length >= 2,
      message: 'Bundle must contain at least 2 items',
    },
  })
  items: string[];

  @Prop({
    required: true,
    enum: Object.values(CorrelationStatus),
  })
  correlation_status: CorrelationStatus;

  @Prop({
    type: String,
    enum: Object.values(RelationType),
    required: true,
  })
  relation_type: RelationType;

  @Prop({
    type: String,
    required: false,
    default: null,
  })
  context?: string | null;

  @Prop({
    type: String,
    required: true,
  })
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

  createdAt?: Date;
  updatedAt?: Date;
}

export const AnnotationsSchema = SchemaFactory.createForClass(Annotations);
