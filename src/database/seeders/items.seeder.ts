import * as fs from 'fs';
import * as path from 'path';

import { NestFactory } from '@nestjs/core';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { AppModule } from '../../app.module';
import { Items } from '../../items/schemas/item.schema';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);

  const itemsModel = app.get<Model<Items>>(getModelToken(Items.name));

  console.log('🧹 Cleaning old items...');

  await itemsModel.deleteMany({});

  const filePath = path.join(__dirname, 'data', 'items.json');

  const jsonData = fs.readFileSync(filePath, 'utf-8');

  const items = JSON.parse(jsonData) as Items[];

  await itemsModel.insertMany(items);

  console.log(`✅ Items seeded successfully: ${items.length}`);

  await app.close();
}

bootstrap().catch((error) => {
  console.error('❌ Items seeder failed:', error);
  process.exit(1);
});
