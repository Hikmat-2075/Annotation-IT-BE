import { Module } from '@nestjs/common';
import { AnnotatorsService } from './annotators.service';
import { AnnotatorsController } from './annotators.controller';

@Module({
  providers: [AnnotatorsService],
  controllers: [AnnotatorsController],
})
export class AnnotatorsModule {}
