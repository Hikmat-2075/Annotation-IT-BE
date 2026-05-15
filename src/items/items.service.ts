import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Items, ItemsDocument } from './schemas/item.schema';
import { CreateItemDto } from './dto/create-item.dto';

@Injectable()
export class ItemsService {
  constructor(
    @InjectModel(Items.name)
    private itemsModel: Model<ItemsDocument>,
  ) {}

  async create(dto: CreateItemDto): Promise<Items> {
    return this.itemsModel.create(dto);
  }

  async findAll(): Promise<Items[]> {
    return this.itemsModel.find().exec();
  }
}
