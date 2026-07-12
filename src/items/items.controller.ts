import {
  Body,
  Controller,
  Get,
  ParseArrayPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtGuard } from '../auth/guards';
import { CreateItemDto } from './dto/create-item.dto';
import { ItemsService } from './items.service';

@ApiTags('Items')
@ApiBearerAuth()
@Controller('items')
export class ItemsController {
  constructor(private readonly itemsService: ItemsService) {}

  @Get()
  @UseGuards(JwtGuard)
  @ApiOperation({ summary: 'Get all items' })
  findAll() {
    return this.itemsService.findAll();
  }

  @Post('bulk')
  @UseGuards(JwtGuard)
  @ApiOperation({ summary: 'Import multiple items at once' })
  @ApiBody({ type: [CreateItemDto] })
  createMany(
    @Body(new ParseArrayPipe({ items: CreateItemDto }))
    items: CreateItemDto[],
  ) {
    return this.itemsService.createMany(items);
  }
}
