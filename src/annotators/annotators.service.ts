import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';

import { InjectModel } from '@nestjs/mongoose';

import { Model } from 'mongoose';

import * as bcrypt from 'bcrypt';

import { Annotators } from './schema/annotator.schema';

import {
  CreateAnnotatorDto,
  UpdateAnnotatorDto,
  AnnotatorResponseDto,
} from './dto';

@Injectable()
export class AnnotatorsService {
  constructor(
    @InjectModel(Annotators.name)
    private readonly annotatorModel: Model<Annotators>,
  ) {}

  async create(createAnnotatorDto: CreateAnnotatorDto) {
    const { name, email, password } = createAnnotatorDto;

    const existingAnnotator = await this.annotatorModel.findOne({
      email,
    });

    if (existingAnnotator) {
      throw new ConflictException('Email already registered');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newAnnotator = new this.annotatorModel({
      name,
      email,
      password: hashedPassword,
    });

    const annotator = await newAnnotator.save();

    return annotator;
  }

  async findAll() {
    return this.annotatorModel
      .find()
      .select('-password')
      .sort({ createdAt: -1 });
  }

  async findOne(id: string) {
    const annotator = await this.annotatorModel
      .findById(id)
      .select('-password');

    if (!annotator) {
      throw new NotFoundException('Annotator not found');
    }

    return annotator;
  }

  async findByEmail(email: string) {
    return this.annotatorModel.findOne({
      email,
    });
  }

  async update(id: string, updateAnnotatorDto: UpdateAnnotatorDto) {
    const { email } = updateAnnotatorDto;
    const updateData = { ...updateAnnotatorDto };

    if (email) {
      const existingAnnotator = await this.annotatorModel.findOne({
        email,
        _id: { $ne: id },
      });

      if (existingAnnotator) {
        throw new ConflictException('Email already in use');
      }
    }

    const annotator = await this.annotatorModel
      .findByIdAndUpdate(id, updateData, {
        new: true,
      })
      .select('-password');

    if (!annotator) {
      throw new NotFoundException('Annotator not found');
    }

    return annotator;
  }

  async remove(id: string) {
    const annotator = await this.annotatorModel
      .findByIdAndDelete(id)
      .select('-password');

    if (!annotator) {
      throw new NotFoundException('Annotator not found');
    }

    return annotator;
  }

  async addCompletedTask(annotatorId: string, taskId: string) {
    const annotator = await this.annotatorModel.findById(annotatorId);

    if (!annotator) {
      throw new NotFoundException('Annotator not found');
    }

    if (annotator.completed_tasks.includes(taskId)) {
      throw new BadRequestException('Task already completed');
    }

    annotator.completed_tasks.push(taskId);

    annotator.total_annotated += 1;

    await annotator.save();

    return this.findOne(annotatorId);
  }

  async removeCompletedTask(annotatorId: string, taskId: string) {
    const annotator = await this.annotatorModel.findById(annotatorId);

    if (!annotator) {
      throw new NotFoundException('Annotator not found');
    }

    const taskIndex = annotator.completed_tasks.indexOf(taskId);

    if (taskIndex === -1) {
      throw new BadRequestException('Task not found in completed tasks');
    }

    annotator.completed_tasks.splice(taskIndex, 1);

    annotator.total_annotated = Math.max(0, annotator.total_annotated - 1);

    await annotator.save();

    return this.findOne(annotatorId);
  }

  async getProfile(id: string) {
    return this.findOne(id);
  }

  async getStatistics() {
    const stats = await this.annotatorModel.aggregate([
      {
        $group: {
          _id: null,
          totalAnnotators: {
            $sum: 1,
          },
          totalAnnotations: {
            $sum: '$total_annotated',
          },
          averageAnnotations: {
            $avg: '$total_annotated',
          },
          maxAnnotations: {
            $max: '$total_annotated',
          },
        },
      },
    ]);

    return (
      stats[0] || {
        totalAnnotators: 0,
        totalAnnotations: 0,
        averageAnnotations: 0,
        maxAnnotations: 0,
      }
    );
  }
}
