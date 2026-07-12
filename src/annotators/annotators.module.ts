import { Module } from '@nestjs/common';
import { AnnotatorsService } from './annotators.service';
import { AnnotatorsController } from './annotators.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Annotator, AnnotatorSchema } from './schema/annotators.schema';
import {
  Transactions,
  TransactionsSchema,
} from '../transactions/schemas/transaction.schema';
import { StorageModule } from '../storage';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Annotator.name, schema: AnnotatorSchema },
      { name: Transactions.name, schema: TransactionsSchema },
    ]),
    StorageModule,
  ],
  providers: [AnnotatorsService],
  controllers: [AnnotatorsController],
})
export class AnnotatorsModule {}
