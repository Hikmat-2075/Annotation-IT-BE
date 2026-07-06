import {
  Controller,
  Body,
  Get,
  Param,
  ParseArrayPipe,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { TransactionsService } from './transactions.service';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { TransactionQueryDto } from './dto/transaction-query.dto';
import type { AuthRequest } from '../common';
import { CreateTransactionDto } from './dto/create-transaction.dto';

@ApiTags('Transactions')
@ApiBearerAuth()
@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Get()
  @UseGuards(JwtGuard)
  @ApiOperation({ summary: 'Get transactions with filters and pagination' })
  findAll(@Query() query: TransactionQueryDto) {
    return this.transactionsService.getAllTransactions(query);
  }

  @Post('bulk')
  @UseGuards(JwtGuard)
  @ApiOperation({ summary: 'Import multiple transactions at once' })
  @ApiBody({ type: [CreateTransactionDto] })
  createMany(
    @Body(new ParseArrayPipe({ items: CreateTransactionDto }))
    transactions: CreateTransactionDto[],
  ) {
    return this.transactionsService.createMany(transactions);
  }

  @Get('my-assigned')
  @UseGuards(JwtGuard)
  @ApiOperation({ summary: 'Get transactions assigned to current annotator' })
  async getMyAssigned(@Req() req: AuthRequest) {
    return this.transactionsService.getAssignedTransactions(req.user.id);
  }

  @Post('assignments/random')
  @UseGuards(JwtGuard)
  @ApiOperation({ summary: 'Assign a random batch to current annotator' })
  async assignRandom(@Req() req: AuthRequest) {
    return this.transactionsService.assignRandomBatch(req.user.id);
  }

  @Post(':id/assign')
  @UseGuards(JwtGuard)
  @ApiOperation({ summary: 'Assign selected transaction to current annotator' })
  async assignSelected(@Req() req: AuthRequest, @Param('id') id: string) {
    return this.transactionsService.assignSelectedTransaction(req.user.id, id);
  }

  @Get('statistics/status-distribution')
  @UseGuards(JwtGuard)
  @ApiOperation({ summary: 'Get transaction status distribution statistics' })
  getStatusDistribution() {
    return this.transactionsService.getStatusDistribution();
  }

  @Get(':id')
  @UseGuards(JwtGuard)
  @ApiOperation({ summary: 'Get transaction detail' })
  async findOne(@Param('id') id: string) {
    return this.transactionsService.getTransactionDetail(id);
  }
}
