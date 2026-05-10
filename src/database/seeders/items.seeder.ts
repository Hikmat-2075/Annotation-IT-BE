import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../app.module';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Items } from '../../items/schemas/item.schema';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);

  const itemsModel = app.get<Model<Items>>(getModelToken(Items.name));

  console.log('🌱 Seeding Items...');

  // optional: reset data dulu
  await itemsModel.deleteMany({});

  await itemsModel.insertMany([
    {
      _id: 'item_kopi_001',
      attributes: {
        name: 'Kopi Arabika 250g',
        brand: 'Excelso',
        category: 'Food & Beverage',
        price: 50000,
        original_price: 60000,
        discount_amount: 10000,
        rating: 4.7,
        review_count: 120,
        sold_count: 300,
        image_url: 'https://example.com/kopi.jpg',
        description: 'Kopi Arabika premium dari Toraja.',
        specifications: {
          weight: '250g',
          roast_level: 'medium',
        },
        tags: ['coffee', 'arabica', 'toraja'],
        origin: 'Toraja',
      },
    },
    {
      _id: 'item_samsung_001',
      attributes: {
        name: 'Samsung Galaxy S24 Ultra',
        brand: 'Samsung',
        category: 'Smartphone',
        price: 17999000,
        original_price: 19999000,
        discount_amount: 2000000,
        rating: 4.9,
        review_count: 2847,
        sold_count: 12500,
        image_url: 'https://example.com/s24.jpg',
        description: 'Flagship Samsung dengan kamera 200MP.',
        specifications: {
          screen: '6.8 QHD+',
          chipset: 'Snapdragon 8 Gen 3',
          battery: '5000mAh',
        },
        tags: ['samsung', 'flagship', '5g'],
        origin: 'Korea',
      },
    },
  ]);

  console.log('✅ Seeding selesai!');

  await app.close();
}

bootstrap();
