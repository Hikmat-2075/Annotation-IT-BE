import { Module } from '@nestjs/common';
import { AnnotatorsService } from './annotators.service';
import { AnnotatorsController } from './annotators.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Annotators, AnnotatorsSchema } from './schema/annotator.schema';
import {
  Transactions,
  TransactionsSchema,
} from '../transactions/schemas/transaction.schema';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Annotators.name, schema: AnnotatorsSchema },
      { name: Transactions.name, schema: TransactionsSchema },
    ]),
    CloudinaryModule,
  ],
  providers: [AnnotatorsService],
  controllers: [AnnotatorsController],
})
export class AnnotatorsModule {}
