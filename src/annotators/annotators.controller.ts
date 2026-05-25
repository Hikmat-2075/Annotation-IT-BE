import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
  UseGuards,
} from '@nestjs/common';

import { AnnotatorsService } from './annotators.service';
import { CreateAnnotatorDto, UpdateAnnotatorDto } from './dto';
import { ImageUploadInterceptor } from '../common/interceptors';
import { JwtGuard } from '../auth/guards/jwt.guard';
import type { Multer } from 'multer';

@Controller('annotators')
export class AnnotatorsController {
  constructor(private readonly annotatorsService: AnnotatorsService) {}

  @Post()
  @UseGuards(JwtGuard)
  @UseInterceptors(ImageUploadInterceptor('profile_image'))
  async create(
    @Body() createAnnotatorDto: CreateAnnotatorDto,
    @UploadedFile() file: Multer.File | undefined,
  ) {
    const annotator = await this.annotatorsService.create(
      createAnnotatorDto,
      file?.buffer,
    );

    return {
      success: true,
      message: 'Annotator created successfully',
      data: annotator,
    };
  }

  @Get()
  @UseGuards(JwtGuard)
  async findAll() {
    const annotators = await this.annotatorsService.findAll();

    return {
      success: true,
      message: 'Annotators retrieved successfully',
      data: annotators,
    };
  }

  @Get('statistics')
  @UseGuards(JwtGuard)
  async getStatistics() {
    const stats = await this.annotatorsService.getStatistics();

    return {
      success: true,
      message: 'Statistics retrieved successfully',
      data: stats,
    };
  }

  @Get(':id')
  @UseGuards(JwtGuard)
  async findOne(@Param('id') id: string) {
    const annotator = await this.annotatorsService.findOne(id);

    return {
      success: true,
      message: 'Annotator retrieved successfully',
      data: annotator,
    };
  }

  @Patch(':id')
  @UseGuards(JwtGuard)
  @UseInterceptors(ImageUploadInterceptor('profile_image'))
  async update(
    @Param('id') id: string,
    @Body() updateAnnotatorDto: UpdateAnnotatorDto,
    @UploadedFile() file: Multer.File | undefined,
  ) {
    const annotator = await this.annotatorsService.update(
      id,
      updateAnnotatorDto,
      file?.buffer,
    );

    return {
      success: true,
      message: 'Annotator updated successfully',
      data: annotator,
    };
  }

  @Delete(':id')
  @UseGuards(JwtGuard)
  async remove(@Param('id') id: string) {
    await this.annotatorsService.remove(id);

    return {
      success: true,
      message: 'Annotator deleted successfully',
    };
  }
}
