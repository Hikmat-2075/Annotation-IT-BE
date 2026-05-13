import * as fs from 'fs';
import * as path from 'path';

import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../app.module';

import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Transactions } from '../../transactions/schemas/transaction.schema';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);

  const transactionModel = app.get<Model<Transactions>>(
    getModelToken(Transactions.name),
  );

  await transactionModel.deleteMany({});

  const filePath = path.join(__dirname, 'data', 'transactions.json');

  const jsonData = fs.readFileSync(filePath, 'utf-8');

  const transactions = JSON.parse(jsonData) as Transactions[];

  await transactionModel.insertMany(transactions);

  console.log('Transactions seeded');
  await app.close();
}

bootstrap();
