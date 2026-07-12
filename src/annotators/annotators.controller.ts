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
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

import { AnnotatorsService } from './annotators.service';
import { CreateAnnotatorDto, UpdateAnnotatorDto } from './dto';
import { ImageUploadInterceptor } from '../common/interceptors';
import { JwtGuard } from '../auth/guards/jwt.guard';
import type { Multer } from 'multer';
import { buildSuccessResponse } from '../common';

@ApiTags('Annotators')
@ApiBearerAuth()
@Controller('annotators')
export class AnnotatorsController {
  constructor(private readonly annotatorsService: AnnotatorsService) {}

  @Post()
  @UseGuards(JwtGuard)
  @ApiOperation({ summary: 'Create annotator' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['name', 'email', 'gender', 'age', 'password'],
      properties: {
        name: { type: 'string', example: 'John Doe' },
        email: { type: 'string', example: 'john@example.com' },
        gender: { type: 'string', enum: ['male', 'female'] },
        age: { type: 'number', example: 21 },
        password: { type: 'string', example: 'password123' },
        profile_uri: {
          type: 'string',
          example: 'https://example.com/profile.jpg',
        },
        profile_image: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(ImageUploadInterceptor('profile_image'))
  async create(
    @Body() createAnnotatorDto: CreateAnnotatorDto,
    @UploadedFile() file: Multer.File | undefined,
  ) {
    return this.annotatorsService.create(
      createAnnotatorDto,
      file?.buffer,
    );
  }

  @Get()
  @UseGuards(JwtGuard)
  @ApiOperation({ summary: 'Get all annotators' })
  async findAll() {
    const annotators = await this.annotatorsService.findAll();

    return buildSuccessResponse(
      'Annotators retrieved successfully',
      annotators,
    );
  }

  @Get('statistics')
  @UseGuards(JwtGuard)
  @ApiOperation({ summary: 'Get annotator statistics' })
  async getStatistics() {
    const stats = await this.annotatorsService.getStatistics();

    return buildSuccessResponse('Statistics retrieved successfully', stats);
  }

  @Get(':id')
  @UseGuards(JwtGuard)
  @ApiOperation({ summary: 'Get annotator by id' })
  async findOne(@Param('id') id: string) {
    const annotator = await this.annotatorsService.findOne(id);

    return buildSuccessResponse('Annotator retrieved successfully', annotator);
  }

  @Patch(':id')
  @UseGuards(JwtGuard)
  @ApiOperation({ summary: 'Update annotator' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'John Doe' },
        email: { type: 'string', example: 'john@example.com' },
        gender: { type: 'string', enum: ['male', 'female'] },
        age: { type: 'number', example: 21 },
        password: { type: 'string', example: 'password123' },
        profile_uri: {
          type: 'string',
          example: 'https://example.com/profile.jpg',
        },
        profile_image: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(ImageUploadInterceptor('profile_image'))
  async update(
    @Param('id') id: string,
    @Body() updateAnnotatorDto: UpdateAnnotatorDto,
    @UploadedFile() file: Multer.File | undefined,
  ) {
    return this.annotatorsService.update(
      id,
      updateAnnotatorDto,
      file?.buffer,
    );
  }

  @Delete(':id')
  @UseGuards(JwtGuard)
  @ApiOperation({ summary: 'Delete annotator' })
  async remove(@Param('id') id: string) {
    await this.annotatorsService.remove(id);

    return buildSuccessResponse('Annotator deleted successfully');
  }
}
