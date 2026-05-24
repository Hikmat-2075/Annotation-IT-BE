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
import type { Multer } from 'multer';

import { AnnotatorsService } from './annotators.service';
import { CreateAnnotatorDto, UpdateAnnotatorDto } from './dto';
import { ImageUploadInterceptor } from '../common/interceptors';
import { JwtGuard } from '../auth/guards/jwt.guard';

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

  @Get(':id/tasks')
  @UseGuards(JwtGuard)
  async getTaskQueue(@Param('id') id: string) {
    const tasks = await this.annotatorsService.getTaskQueue(id);
    return {
      success: true,
      message: 'Annotator task queue retrieved successfully',
      data: tasks,
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
    return this.annotatorsService.update(id, updateAnnotatorDto, file?.buffer);
  }

  @Delete(':id')
  @UseGuards(JwtGuard)
  async remove(@Param('id') id: string) {
    return this.annotatorsService.remove(id);
  }

  @Post(':id/tasks/:taskId')
  @UseGuards(JwtGuard)
  async addCompletedTask(
    @Param('id') id: string,
    @Param('taskId') taskId: string,
  ) {
    const annotator = await this.annotatorsService.addCompletedTask(id, taskId);
    return {
      success: true,
      message: 'Task added to completed tasks',
      data: annotator,
    };
  }

  @Delete(':id/tasks/:taskId')
  @UseGuards(JwtGuard)
  async removeCompletedTask(
    @Param('id') id: string,
    @Param('taskId') taskId: string,
  ) {
    const annotator = await this.annotatorsService.removeCompletedTask(
      id,
      taskId,
    );
    return {
      success: true,
      message: 'Task removed from completed tasks',
      data: annotator,
    };
  }
}
