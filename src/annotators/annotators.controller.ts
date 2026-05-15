import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AnnotatorsService } from './annotators.service';
import { CreateAnnotatorDto, UpdateAnnotatorDto } from './dto';
import { JwtGuard } from '../auth/guards';

@Controller('annotators')
export class AnnotatorsController {
  constructor(private readonly annotatorsService: AnnotatorsService) {}

  @Post()
  async create(@Body() createAnnotatorDto: CreateAnnotatorDto) {
    const annotator = await this.annotatorsService.create(createAnnotatorDto);
    return {
      success: true,
      message: 'Annotator created successfully',
      data: annotator,
    };
  }

  @Get()
  async findAll() {
    const annotators = await this.annotatorsService.findAll();
    return {
      success: true,
      message: 'Annotators retrieved successfully',
      data: annotators,
    };
  }

  @Get('statistics')
  async getStatistics() {
    const stats = await this.annotatorsService.getStatistics();
    return {
      success: true,
      message: 'Statistics retrieved successfully',
      data: stats,
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const annotator = await this.annotatorsService.findOne(id);
    return {
      success: true,
      message: 'Annotator retrieved successfully',
      data: annotator,
    };
  }

  @UseGuards(JwtGuard)
  @Get('profile/me')
  async getProfile(@Request() req: any) {
    const annotator = await this.annotatorsService.getProfile(req.user.id);
    return {
      success: true,
      message: 'Profile retrieved successfully',
      data: annotator,
    };
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateAnnotatorDto: UpdateAnnotatorDto,
  ) {
    const annotator = await this.annotatorsService.update(
      id,
      updateAnnotatorDto,
    );
    return {
      success: true,
      message: 'Annotator updated successfully',
      data: annotator,
    };
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    const annotator = await this.annotatorsService.remove(id);
    return {
      success: true,
      message: 'Annotator deleted successfully',
      data: annotator,
    };
  }

  @Post(':id/tasks/:taskId')
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
