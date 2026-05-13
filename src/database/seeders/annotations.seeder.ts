import * as fs from 'fs';
import * as path from 'path';

import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../app.module';

import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Annotations } from '../../annotations/schema/annotation.schema';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);

  const AnnotationModel = app.get<Model<Annotations>>(
    getModelToken(Annotations.name),
  );

  await AnnotationModel.deleteMany({});

  const filePath = path.join(__dirname, 'data', 'annotators.json');

  const jsonData = fs.readFileSync(filePath, 'utf-8');

  const annotations = JSON.parse(jsonData) as Annotations[];

  await AnnotationModel.insertMany(annotations);

  console.log('Annotations seeded');
  await app.close();
}

bootstrap();
