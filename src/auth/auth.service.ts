import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { RegisterDto, LoginDto } from './dto';
import { v4 as uuidv4 } from 'uuid';
import { Annotators } from '../annotators/schema/annotator.schema';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(Annotators.name)
    private annotatorModel: Model<Annotators>,
    private jwtService: JwtService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async register(registerDto: RegisterDto) {
    const { name, email, password, confirm_password } = registerDto;

    if (password !== confirm_password) {
      throw new BadRequestException('Passwords do not match');
    }

    // Check if annotator already exists
    const existingAnnotator = await this.annotatorModel.findOne({ email });
    if (existingAnnotator) {
      throw new BadRequestException('Email already registered');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new annotator
    const newAnnotator = new this.annotatorModel({
      _id: uuidv4(),
      name,
      email,
      password: hashedPassword,
      completed_tasks: [],
      total_annotated: 0,
      last_login: null,
    });

    const annotator = await newAnnotator.save();

    return {
      message: 'Registration successful',
      data: {
        id: annotator._id,
        name: annotator.name,
        email: annotator.email,
      },
    };
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    const annotator = await this.annotatorModel.findOne({ email });
    if (!annotator) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(password, annotator.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    annotator.last_login = new Date();
    await annotator.save();

    const tokens = await this.getTokens(annotator);

    return {
      message: 'Login successful',
      data: {
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
      },
    };
  }

  async refreshToken(refreshToken: string) {
    let payload: any;

    try {
      payload = await this.jwtService.verifyAsync(refreshToken);
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (payload.type !== 'refresh') {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const annotator = await this.annotatorModel.findById(payload.sub);

    if (!annotator) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const tokens = await this.getTokens(annotator);

    return {
      message: 'Token refreshed successfully',
      data: {
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
      },
    };
  }

  private async getTokens(annotator: Annotators) {
    const accessPayload = {
      sub: annotator._id,
      email: annotator.email,
      name: annotator.name,
      type: 'access',
    };

    const refreshPayload = {
      sub: annotator._id,
      type: 'refresh',
    };

    const access_token = await this.jwtService.signAsync(accessPayload, {
      expiresIn: '15m',
    });

    const refresh_token = await this.jwtService.signAsync(refreshPayload, {
      expiresIn: '7d',
    });

    return {
      access_token,
      refresh_token,
    };
  }

  async getProfile(id: string) {
    const annotator = await this.annotatorModel
      .findOne({ _id: id })
      .select('-password');

    if (!annotator) {
      throw new UnauthorizedException('Annotator not found');
    }

    return {
      message: 'Profile retrieved successfully',
      data: annotator,
    };
  }

  async uploadProfileImage(id: string, fileBuffer: Buffer) {
    const fileName = `${id}-${Date.now()}`;

    const profileUri = await this.cloudinaryService.uploadImage(
      fileBuffer,
      fileName,
      'auth/profiles',
    );

    const annotator = await this.annotatorModel
      .findOneAndUpdate({ _id: id }, { profile_uri: profileUri }, { new: true })
      .select('-password');

    if (!annotator) {
      throw new UnauthorizedException('Annotator not found');
    }

    return {
      message: 'Profile image uploaded successfully',
      data: annotator,
    };
  }
}
