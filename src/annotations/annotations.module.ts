import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { AnnotationsController } from './annotations.controller';
import { AnnotationsService } from './annotations.service';

import { Annotations, AnnotationsSchema } from './schema/annotation.schema';
import {
  Annotator,
  AnnotatorSchema,
} from '../annotators/schema/annotators.schema';
import {
  Transactions,
  TransactionsSchema,
} from '../transactions/schemas/transaction.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Annotations.name, schema: AnnotationsSchema },
      { name: Annotator.name, schema: AnnotatorSchema },
      { name: Transactions.name, schema: TransactionsSchema },
    ]),
  ],
  controllers: [AnnotationsController],
  providers: [AnnotationsService],
})
export class AnnotationsModule {}
