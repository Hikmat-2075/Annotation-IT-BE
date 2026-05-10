import { Module } from '@nestjs/common';
import { AnnotationsController } from './annotations.controller';
import { AnnotationsService } from './annotations.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Annotations, AnnotationsSchema } from './schema/annotation.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Annotations.name, schema: AnnotationsSchema },
    ]),
  ],
  controllers: [AnnotationsController],
  providers: [AnnotationsService],
})
export class AnnotationsModule {}
