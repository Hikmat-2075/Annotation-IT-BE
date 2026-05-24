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
import { Transactions } from '../transactions/schemas/transaction.schema';
import { CreateAnnotatorDto, UpdateAnnotatorDto } from './dto';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Injectable()
export class AnnotatorsService {
  constructor(
    @InjectModel(Annotators.name)
    private readonly annotatorModel: Model<Annotators>,
    @InjectModel(Transactions.name)
    private readonly transactionModel: Model<Transactions>,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async create(createAnnotatorDto: CreateAnnotatorDto, fileBuffer?: Buffer) {
    const {
      name,
      email,
      password,
      completed_tasks,
      total_annotated,
      last_login,
      profile_uri,
    } = createAnnotatorDto;

    const existingAnnotator = await this.annotatorModel.findOne({ email });

    if (existingAnnotator) {
      throw new ConflictException('Email already registered');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    let uploadedProfileUri = profile_uri;

    // Upload profile image if file provided
    if (fileBuffer) {
      const fileName = `${email}-${Date.now()}`;
      uploadedProfileUri = await this.cloudinaryService.uploadImage(
        fileBuffer,
        fileName,
        'annotators/profiles',
      );
    }

    const newAnnotator = new this.annotatorModel({
      name,
      email,
      password: hashedPassword,
      completed_tasks: completed_tasks ?? [],
      total_annotated: total_annotated ?? 0,
      last_login: last_login ?? null,
      profile_uri: uploadedProfileUri,
    });

    const annotator = await newAnnotator.save();

    const { password: _, ...result } = annotator.toObject();

    return {
      message: 'Annotator created successfully',
      data: result,
    };
  }

  async findAll() {
    return this.annotatorModel
      .find()
      .select('-password')
      .sort({ createdAt: -1 });
  }

  async findOne(id: string) {
    const annotator = await this.annotatorModel
      .findOne({ _id: id })
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

  async update(
    id: string,
    updateAnnotatorDto: UpdateAnnotatorDto,
    fileBuffer?: Buffer,
  ) {
    const { email } = updateAnnotatorDto;

    const updateData: Partial<UpdateAnnotatorDto> & {
      profile_uri?: string;
    } = {
      ...updateAnnotatorDto,
    };

    if (email) {
      const existingAnnotator = await this.annotatorModel.findOne({
        email,
        _id: { $ne: id },
      });

      if (existingAnnotator) {
        throw new ConflictException('Email already in use');
      }
    }

    if (fileBuffer) {
      const fileName = `${id}-${Date.now()}`;

      updateData.profile_uri = await this.cloudinaryService.uploadImage(
        fileBuffer,
        fileName,
        'annotators/profiles',
      );
    }

    const annotator = await this.annotatorModel
      .findByIdAndUpdate(id, updateData, {
        new: true,
      })
      .select('-password');

    if (!annotator) {
      throw new NotFoundException('Annotator not found');
    }

    return {
      message: 'Annotator updated successfully',
      data: annotator,
    };
  }

  async remove(id: string) {
    const annotator = await this.annotatorModel.findByIdAndDelete(id);

    if (!annotator) {
      throw new NotFoundException('Annotator not found');
    }

    return {
      message: 'Annotator deleted successfully',
      data: null,
    };
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

  async getTaskQueue(annotatorId: string) {
    const annotator = await this.annotatorModel.findById(annotatorId);

    if (!annotator) {
      throw new NotFoundException('Annotator not found');
    }

    const queue = await this.transactionModel
      .find({
        _id: {
          $nin: annotator.completed_tasks ?? [],
        },
      })
      .limit(2);

    return queue;
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

  async uploadProfileImage(
    annotatorId: string,
    fileBuffer: Buffer,
  ): Promise<any> {
    const annotator = await this.annotatorModel.findById(annotatorId);

    if (!annotator) {
      throw new NotFoundException('Annotator not found');
    }

    const fileName = `${annotatorId}-${Date.now()}`;

    const secureUrl = await this.cloudinaryService.uploadImage(
      fileBuffer,
      fileName,
      'annotators/update',
    );

    const updatedAnnotator = await this.annotatorModel
      .findByIdAndUpdate(annotatorId, { profile_uri: secureUrl }, { new: true })
      .select('-password');

    return updatedAnnotator;
  }
}
