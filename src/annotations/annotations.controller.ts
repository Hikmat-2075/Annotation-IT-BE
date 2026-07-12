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
import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { AnnotationsService } from './annotations.service';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { SubmitAnnotationDto } from './dto/submit-annotation.dto';
import type { Response } from 'express';
import {
  AnnotationExportAllUsersQueryDto,
  AnnotationExportQueryDto,
  AnnotationHistoryQueryDto,
} from './dto/annotation-history-query-dto';
import type { AuthRequest } from '../common';

@ApiTags('Annotations')
@ApiBearerAuth()
@Controller('annotations')
export class AnnotationsController {
  constructor(private readonly annotationsService: AnnotationsService) {}

  @Get('relation-types')
  @UseGuards(JwtGuard)
  @ApiOperation({ summary: 'Get available relation types' })
  getRelationTypes() {
    return this.annotationsService.getRelationTypes();
  }

  @Post('submit')
  @UseGuards(JwtGuard)
  @ApiOperation({ summary: 'Submit annotation bundles for a transaction' })
  submitAnnotation(@Req() req: AuthRequest, @Body() dto: SubmitAnnotationDto) {
    return this.annotationsService.submitAnnotation(req.user.id, dto);
  }

  @Get('history')
  @UseGuards(JwtGuard)
  @ApiOperation({ summary: 'Get annotation history' })
  getHistory(@Query() query: AnnotationHistoryQueryDto) {
    return this.annotationsService.getHistory(query);
  }

  @Get('export/all-users')
  @UseGuards(JwtGuard)
  @ApiOperation({ summary: 'Export annotations from all users as JSON or CSV' })
  exportAllUsersAnnotations(
    @Query() query: AnnotationExportAllUsersQueryDto,
    @Res() res: Response,
  ) {
    return this.annotationsService.exportAllUsersAnnotations(query, res);
  }

  @Get('export')
  @UseGuards(JwtGuard)
  @ApiOperation({ summary: 'Export annotations as JSON or CSV' })
  exportAnnotations(
    @Query() query: AnnotationExportQueryDto,
    @Res() res: Response,
  ) {
    return this.annotationsService.exportAnnotations(query, res);
  }

  @Get(':annotationId/bundles/:bundleId')
  @UseGuards(JwtGuard)
  @ApiOperation({ summary: 'Get annotation bundle detail' })
  getBundleDetail(
    @Param('annotationId') annotationId: string,
    @Param('bundleId') bundleId: string,
  ) {
    return this.annotationsService.getBundleDetail(annotationId, bundleId);
  }

  @Get('statistics/correlation-distribution')
  @UseGuards(JwtGuard)
  @ApiOperation({ summary: 'Get annotation correlation distribution' })
  getCorrelationDistribution() {
    return this.annotationsService.getCorrelationDistribution();
  }

  @Get('statistics/summary')
  @UseGuards(JwtGuard)
  @ApiOperation({ summary: 'Get annotation summary statistics' })
  getSummaryStatistics() {
    return this.annotationsService.getSummaryStatistics();
  }

  @Get(':id')
  @UseGuards(JwtGuard)
  @ApiOperation({ summary: 'Get annotation detail' })
  getAnnotationDetail(@Param('id') id: string) {
    return this.annotationsService.getAnnotationDetail(id);
  }
}
