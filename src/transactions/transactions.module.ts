import { Module } from '@nestjs/common';
import { TransactionsController } from './transactions.controller';
import { TransactionsService } from './transactions.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Transactions, TransactionsSchema } from './schemas/transaction.schema';
import { Items, ItemsSchema } from '../items/schemas/item.schema';
import {
  Annotator,
  AnnotatorSchema,
} from '../annotators/schema/annotators.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Transactions.name, schema: TransactionsSchema },
      { name: Items.name, schema: ItemsSchema },
      { name: Annotator.name, schema: AnnotatorSchema },
    ]),
  ],
  controllers: [TransactionsController],
  providers: [TransactionsService],
})
export class TransactionsModule {}
