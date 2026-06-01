import * as fs from 'fs';
import * as path from 'path';

import { NestFactory } from '@nestjs/core';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { AppModule } from '../../app.module';
import { Transactions } from '../../transactions/schemas/transaction.schema';
import { Annotations } from '../../annotations/schema/annotation.schema';
import { Annotator } from '../../annotators/schema/annotators.schema';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);

  const transactionModel = app.get<Model<Transactions>>(
    getModelToken(Transactions.name),
  );

  const annotationModel = app.get<Model<Annotations>>(
    getModelToken(Annotations.name),
  );

  const annotatorModel = app.get<Model<Annotator>>(
    getModelToken(Annotator.name),
  );

  const itemCount = await itemsModel.countDocuments();

  if (itemCount === 0) {
    throw new Error('Items collection is empty. Run seed:items first.');
  }

  console.log('🧹 Cleaning old transactions and annotations...');

  await annotationModel.deleteMany({});
  await transactionModel.deleteMany({});

  await annotatorModel.updateMany(
    {},
    {
      $set: {
        current_batch: [],
        completed_tasks: [],
        total_annotated: 0,
      },
    },
  );

  const filePath = path.join(__dirname, 'data', 'transactions.json');
  const jsonData = fs.readFileSync(filePath, 'utf-8');
  const transactions = JSON.parse(jsonData) as Transactions[];

  await transactionModel.insertMany(transactions);

  console.log(`✅ Transactions seeded successfully: ${transactions.length}`);

  await app.close();
}

bootstrap().catch((error) => {
  console.error('❌ Transactions seeder failed:', error);
  process.exit(1);
});
