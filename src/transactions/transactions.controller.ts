import {
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { TransactionsService } from './transactions.service';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { TransactionQueryDto } from './dto/transaction-query.dto';

interface AuthRequest extends Request {
  user: {
    id: string;
  };
}

@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Get()
  @UseGuards(JwtGuard)
  findAll(@Query() query: TransactionQueryDto) {
    return this.transactionsService.getAllTransactions(query);
  }

  @Get('my-assigned')
  @UseGuards(JwtGuard)
  async getMyAssigned(@Req() req: AuthRequest) {
    return this.transactionsService.getAssignedTransactions(req.user.id);
  }

  @Post('assignments/random')
  @UseGuards(JwtGuard)
  async assignRandom(@Req() req: AuthRequest) {
    return this.transactionsService.assignRandomBatch(req.user.id);
  }

  @Post(':id/assign')
  @UseGuards(JwtGuard)
  async assignSelected(@Req() req: AuthRequest, @Param('id') id: string) {
    return this.transactionsService.assignSelectedTransaction(req.user.id, id);
  }

  @Get('statistics/status-distribution')
  @UseGuards(JwtGuard)
  getStatusDistribution() {
    return this.transactionsService.getStatusDistribution();
  }

  @Get(':id')
  @UseGuards(JwtGuard)
  async findOne(@Param('id') id: string) {
    return this.transactionsService.getTransactionDetail(id);
  }
}
