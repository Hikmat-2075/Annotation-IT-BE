import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import { Annotator, AnnotatorDocument } from './schema/annotators.schema';
import { CreateAnnotatorDto, UpdateAnnotatorDto } from './dto';
import { StorageService } from '../storage';

@Injectable()
export class AnnotatorsService {
  constructor(
    @InjectModel(Annotator.name)
    private readonly annotatorModel: Model<AnnotatorDocument>,
    private readonly storageService: StorageService,
  ) {}

  async create(createAnnotatorDto: CreateAnnotatorDto, fileBuffer?: Buffer) {
    const { name, email, password, gender, age, profile_uri } =
      createAnnotatorDto;
    const normalizedEmail = email.trim().toLowerCase();

    const existingAnnotator = await this.annotatorModel.findOne({
      email: normalizedEmail,
    });

    if (existingAnnotator) {
      throw new ConflictException('Email already registered');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    let uploadedProfileUri: string | undefined = profile_uri;

    if (fileBuffer) {
      const fileName = `${email}-${Date.now()}`;
      uploadedProfileUri = await this.storageService.uploadImage(
        fileBuffer,
        fileName,
        'annotators/profiles',
      );
    }

    const createData: Partial<Annotator> = {
      _id: randomUUID(),
      name,
      email: normalizedEmail,
      gender,
      age,
      password: hashedPassword,
    };

    if (uploadedProfileUri) {
      createData.profile_uri = uploadedProfileUri;
    }

    const newAnnotator = new this.annotatorModel(createData);

    const annotator = await newAnnotator.save();
    const { password: _, ...result } = annotator.toObject() as Record<
      string,
      any
    >;

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
      email: email.trim().toLowerCase(),
    });
  }

  async update(
    id: string,
    updateAnnotatorDto: UpdateAnnotatorDto,
    fileBuffer?: Buffer,
  ) {
    const { email, password, ...fields } = updateAnnotatorDto;
    const normalizedEmail = email?.trim().toLowerCase();

    const updateData: Partial<UpdateAnnotatorDto> & {
      profile_uri?: string;
    } = {
      ...fields,
    };

    if (normalizedEmail) {
      const existingAnnotator = await this.annotatorModel.findOne({
        email: normalizedEmail,
        _id: { $ne: id },
      });

      if (existingAnnotator) {
        throw new ConflictException('Email already in use');
      }

      updateData.email = normalizedEmail;
    }

    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    if (fileBuffer) {
      const fileName = `${id}-${Date.now()}`;

      updateData.profile_uri = await this.storageService.uploadImage(
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

    const secureUrl = await this.storageService.uploadImage(
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
