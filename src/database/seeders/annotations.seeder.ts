import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../app.module';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Annotations } from '../../annotations/schema/annotation.schema';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);

  const model = app.get<Model<Annotations>>(getModelToken(Annotations.name));

  await model.deleteMany({});

  await model.insertMany([
    {
      transaction_id: 'trx_98765',
      annotator_id: 'staff_id_001',
      bundles: [
        {
          bundle_id: 'B001',
          items: ['item_kopi_001', 'item_susu_002'],
          relation_type: 'complementary',
          context: 'Breakfast Combo',
          reasoning:
            'User membeli kopi dan susu dalam waktu dekat untuk sarapan.',
        },
      ],
    },
  ]);

  console.log('Annotations seeded');
  await app.close();
}

bootstrap();
