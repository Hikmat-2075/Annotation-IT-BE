import { Module } from '@nestjs/common';
import { AnnotatorsService } from './annotators.service';
import { AnnotatorsController } from './annotators.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Annotators, AnnotatorsSchema } from './schema/annotator.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Annotators.name, schema: AnnotatorsSchema },
    ]),
  ],
  providers: [AnnotatorsService],
  controllers: [AnnotatorsController],
})
export class AnnotatorsModule {}
