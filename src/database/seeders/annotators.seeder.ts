import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../app.module';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Annotators } from '../../annotators/schema/annotator.schema';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);

  const model = app.get<Model<Annotators>>(getModelToken(Annotators.name));

  await model.deleteMany({});

  await model.insertMany([
    {
      _id: 'staff_id_001',
      name: 'Andi Pratama',
      completed_tasks: ['trx_98765'],
      total_annotated: 1,
      last_login: new Date('2026-05-01T14:00:00Z'),
    },
  ]);

  console.log('Annotators seeded');
  await app.close();
}

bootstrap();
