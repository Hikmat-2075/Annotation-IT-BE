import { Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { TransactionsService } from './transactions.service';
import { JwtGuard } from '../auth/guards/jwt.guard';

interface AuthRequest extends Request {
  user: {
    id: string;
  };
}

@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post('assignments')
  @UseGuards(JwtGuard)
  async createAssignment(@Req() req: AuthRequest) {
    const annotatorId = req.user?.id;
    const transactions =
      await this.transactionsService.createAssignment(annotatorId);
    return {
      success: true,
      message: 'Transaction assignment retrieved successfully',
      data: transactions,
    };
  }

  @Get(':id')
  @UseGuards(JwtGuard)
  async findOne(@Param('id') id: string) {
    const trx = await this.transactionsService.getTransactionDetail(id);
    return {
      success: true,
      message: 'Transaction retrieved successfully',
      data: trx,
    };
  }
}
