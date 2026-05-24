import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { JwtGuard } from '../auth/guards/jwt.guard';

@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

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
