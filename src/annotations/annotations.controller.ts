import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AnnotationsService } from './annotations.service';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { SubmitAnnotationDto } from './dto/submit-annotation.dto';
import type { Response } from 'express';
import { AnnotationHistoryQueryDto } from './dto/annotation-history-query-dto';

@Controller('annotations')
export class AnnotationsController {
  constructor(private readonly annotationsService: AnnotationsService) {}

  @Get('relation-types')
  @UseGuards(JwtGuard)
  getRelationTypes() {
    return this.annotationsService.getRelationTypes();
  }

  @Post('submit')
  @UseGuards(JwtGuard)
  submitAnnotation(@Req() req: any, @Body() dto: SubmitAnnotationDto) {
    return this.annotationsService.submitAnnotation(req.user.id, dto);
  }
  @Get('history')
  @UseGuards(JwtGuard)
  getHistory(@Query() query: AnnotationHistoryQueryDto) {
    return this.annotationsService.getHistory(query);
  }

  @Get('export')
  @UseGuards(JwtGuard)
  exportAnnotations(
    @Query() query: AnnotationHistoryQueryDto & { format?: 'json' | 'csv' },
    @Res() res: Response,
  ) {
    return this.annotationsService.exportAnnotations(query, res);
  }

  @Get(':annotationId/bundles/:bundleId')
  @UseGuards(JwtGuard)
  getBundleDetail(
    @Param('annotationId') annotationId: string,
    @Param('bundleId') bundleId: string,
  ) {
    return this.annotationsService.getBundleDetail(annotationId, bundleId);
  }

  @Get('statistics/correlation-distribution')
  @UseGuards(JwtGuard)
  getCorrelationDistribution() {
    return this.annotationsService.getCorrelationDistribution();
  }

  @Get('statistics/summary')
  @UseGuards(JwtGuard)
  getSummaryStatistics() {
    return this.annotationsService.getSummaryStatistics();
  }

  @Get(':id')
  @UseGuards(JwtGuard)
  getAnnotationDetail(@Param('id') id: string) {
    return this.annotationsService.getAnnotationDetail(id);
  }
}
