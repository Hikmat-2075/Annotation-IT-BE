import * as fs from 'fs';
import * as path from 'path';

import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../app.module';

import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Annotator } from '../../annotators/schema/annotators.schema';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);

  const AnnotatorsModel = app.get<Model<Annotator>>(
    getModelToken(Annotator.name),
  );

  await AnnotatorsModel.deleteMany({});

  const filePath = path.join(__dirname, 'data', 'annotators.json');

  const jsonData = fs.readFileSync(filePath, 'utf-8');

  const annotators = JSON.parse(jsonData) as Annotator[];

  await AnnotatorsModel.insertMany(annotators);

  console.log('Annotators seeded');
  await app.close();
}

bootstrap();
