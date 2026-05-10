import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../app.module';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Transactions } from '../../transactions/schemas/transaction.schema';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);

  const model = app.get<Model<Transactions>>(getModelToken(Transactions.name));

  await model.deleteMany({});

  await model.insertMany([
    {
      _id: 'trx_98765',
      user_id: 'user_pro_22',
      list_of_interaction_items: {
        item_kopi_001: {
          order_number: 1,
          timestamp: 1714546800,
          rating: 5,
          attributes: { promo: 'flash_sale' },
        },
        item_susu_002: {
          order_number: 2,
          timestamp: 1714546810,
          rating: null,
          attributes: { quantity: 2 },
        },
      },
    },
  ]);

  console.log('Transactions seeded');
  await app.close();
}

bootstrap();
