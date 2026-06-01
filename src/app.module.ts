import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import databaseConfig from './config/database.config';

import { ItemsModule } from './items/items.module';
import { TransactionsModule } from './transactions/transactions.module';
import { AnnotatorsModule } from './annotators/annotators.module';
import { AnnotationsModule } from './annotations/annotations.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      load: [databaseConfig],
    }),

    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('database.uri'),
      }),
    }),

    ItemsModule,
    TransactionsModule,
    AnnotatorsModule,
    AnnotationsModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
