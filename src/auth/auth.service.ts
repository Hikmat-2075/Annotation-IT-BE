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

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(Annotators.name)
    private annotatorModel: Model<Annotators>,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    const { name, email, password } = registerDto;

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

    // Generate JWT token
    const token = this.jwtService.sign({
      id: annotator._id,
      email: annotator.email,
      name: annotator.name,
    });

    return {
      success: true,
      message: 'Registration successful',
      data: {
        id: annotator._id,
        name: annotator.name,
        email: annotator.email,
        token,
      },
    };
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    // Find annotator by email
    const annotator = await this.annotatorModel.findOne({ email });
    if (!annotator) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Compare passwords
    const isPasswordValid = await bcrypt.compare(password, annotator.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Update last login
    annotator.last_login = new Date();
    await annotator.save();

    // Generate JWT token
    const token = this.jwtService.sign({
      id: annotator._id,
      email: annotator.email,
      name: annotator.name,
    });

    return {
      success: true,
      message: 'Login successful',
      data: {
        id: annotator._id,
        name: annotator.name,
        email: annotator.email,
        token,
      },
    };
  }
}
