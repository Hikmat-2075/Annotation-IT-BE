import * as fs from 'fs';
import * as path from 'path';

import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../app.module';

import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Items } from '../../items/schemas/item.schema';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);

  const itemsModel = app.get<Model<Items>>(getModelToken(Items.name));

  console.log('🌱 Seeding Items...');

  await itemsModel.deleteMany({});

  const filePath = path.join(__dirname, 'data', 'items.json');

  const jsonData = fs.readFileSync(filePath, 'utf-8');

  const items = JSON.parse(jsonData) as Items[];

  await itemsModel.insertMany(items);

  console.log('✅ Items seeded successfully');

  await app.close();
}

bootstrap();
