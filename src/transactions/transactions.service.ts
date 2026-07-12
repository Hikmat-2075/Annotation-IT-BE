import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Transactions } from './schemas/transaction.schema';
import { TransactionStatus } from './enums/transaction-status.enum';
import { Items } from '../items/schemas/item.schema';
import {
  Annotator,
  AnnotatorDocument,
} from '../annotators/schema/annotators.schema';
import { TransactionQueryDto } from './dto/transaction-query.dto';
import { calculatePercentage, getPagination } from '../common/utils';
import { buildTransactionFilter } from './config';
import {
  buildItemMap,
  normalizeInteractionItems,
  sortByInteractionOrder,
} from './helpers';
import { CreateTransactionDto } from './dto/create-transaction.dto';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectModel(Transactions.name)
    private readonly transactionModel: Model<Transactions>,
    @InjectModel(Items.name)
    private readonly itemsModel: Model<Items>,
    @InjectModel(Annotator.name)
    private readonly annotatorModel: Model<AnnotatorDocument>,
  ) {}

  async createAssignment(annotatorId: string) {
    return this.assignRandomBatch(annotatorId);
  }

  async createMany(dtos: CreateTransactionDto[]) {
    const transactions = await this.transactionModel.insertMany(dtos);

    return {
      message: 'Transactions imported successfully',
      data: {
        inserted_count: transactions.length,
      },
    };
  }

  async getTransactionDetail(id: string) {
    const trx = await this.transactionModel.findOne({ _id: id }).lean();

    if (!trx) {
      throw new NotFoundException('Transaction not found');
    }

    const interactionObj = normalizeInteractionItems(
      trx.list_of_interaction_items,
    );
    const itemIds = Object.keys(interactionObj);
    const items = await this.itemsModel.find({ _id: { $in: itemIds } }).lean();
    const itemsMap = buildItemMap(items);

    const assembled = itemIds.map((itemId) => ({
      item_id: itemId,
      interaction: interactionObj[itemId],
      metadata: itemsMap.get(itemId) ?? null,
    }));

    return {
      _id: trx._id,
      user_id: trx.user_id,
      status: trx.status,
      assigned_by: trx.assigned_by,
      assigned_at: trx.assigned_at,
      annotated_at: trx.annotated_at,
      createdAt: trx.createdAt,
      updatedAt: trx.updatedAt,
      items: sortByInteractionOrder(assembled),
    };
  }

  async getAllTransactions(query: TransactionQueryDto) {
    const { page, limit, skip } = getPagination(query);
    const filter = buildTransactionFilter(query);

    const [transactions, total] = await Promise.all([
      this.transactionModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),

      this.transactionModel.countDocuments(filter),
    ]);

    const data = await this.mapTransactionsResponse(transactions);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        total_page: Math.ceil(total / limit),
      },
    };
  }

  async assignRandomBatch(annotatorId: string) {
    const annotator = await this.annotatorModel.findById(annotatorId);

    if (!annotator) {
      throw new NotFoundException('Annotator not found');
    }

    const currentBatch = annotator.current_batch ?? [];

    if (currentBatch.length > 0) {
      return this.getAssignedTransactions(annotatorId);
    }

    const selectedIds: string[] = [];

    for (let i = 0; i < 10; i++) {
      const [sample] = await this.transactionModel.aggregate([
        {
          $match: {
            status: TransactionStatus.AVAILABLE,
          },
        },
        {
          $sample: {
            size: 1,
          },
        },
      ]);

      if (!sample) {
        break;
      }

      const assigned = await this.transactionModel.findOneAndUpdate(
        {
          _id: sample._id,
          status: TransactionStatus.AVAILABLE,
        },
        {
          $set: {
            status: TransactionStatus.ASSIGNED,
            assigned_by: annotatorId,
            assigned_at: new Date(),
          },
        },
        {
          new: true,
        },
      );

      if (assigned) {
        selectedIds.push(String(assigned._id));
      }
    }

    if (!selectedIds.length) {
      return [];
    }

    await this.annotatorModel.updateOne(
      { _id: annotatorId },
      {
        $addToSet: {
          current_batch: {
            $each: selectedIds,
          },
        },
      },
    );

    return this.getAssignedTransactions(annotatorId);
  }

  async assignSelectedTransaction(annotatorId: string, transactionId: string) {
    const annotator = await this.annotatorModel.findById(annotatorId);

    if (!annotator) {
      throw new NotFoundException('Annotator not found');
    }

    const transaction = await this.transactionModel.findOneAndUpdate(
      {
        _id: transactionId,
        status: TransactionStatus.AVAILABLE,
      },
      {
        $set: {
          status: TransactionStatus.ASSIGNED,
          assigned_by: annotatorId,
          assigned_at: new Date(),
        },
      },
      {
        new: true,
      },
    );

    if (!transaction) {
      throw new ConflictException(
        'Transaction is not available or already assigned',
      );
    }

    await this.annotatorModel.updateOne(
      { _id: annotatorId },
      {
        $addToSet: {
          current_batch: transactionId,
        },
      },
    );

    return {
      message: 'Transaction assigned successfully',
      data: null,
    };
  }

  async getAssignedTransactions(annotatorId: string) {
    const trxs = await this.transactionModel
      .find({
        assigned_by: annotatorId,
        status: TransactionStatus.ASSIGNED,
      })
      .sort({ assigned_at: -1 })
      .lean();

    return await this.mapTransactionsResponse(trxs);
  }

  async getStatusDistribution() {
    const result = await this.transactionModel.aggregate([
      {
        $group: {
          _id: '$status',
          total: { $sum: 1 },
        },
      },
    ]);

    const totalTransactions = result.reduce((sum, item) => sum + item.total, 0);

    const available =
      result.find((item) => item._id === TransactionStatus.AVAILABLE)?.total ??
      0;

    const assigned =
      result.find((item) => item._id === TransactionStatus.ASSIGNED)?.total ??
      0;

    const annotated =
      result.find((item) => item._id === TransactionStatus.ANNOTATED)?.total ??
      0;

    return {
      message: 'Success',
      data: {
        total: totalTransactions,
        available: {
          total: available,
          percentage: calculatePercentage(available, totalTransactions),
        },
        assigned: {
          total: assigned,
          percentage: calculatePercentage(assigned, totalTransactions),
        },
        annotated: {
          total: annotated,
          percentage: calculatePercentage(annotated, totalTransactions),
        },
      },
    };
  }

  private async mapTransactionsResponse(transactions: any[]) {
    return Promise.all(
      transactions.map(async (trx) => {
        const interactionObj = normalizeInteractionItems(
          trx.list_of_interaction_items,
        );
        const itemIds = Object.keys(interactionObj);
        const items = await this.itemsModel
          .find({ _id: { $in: itemIds } })
          .lean();
        const itemsMap = buildItemMap(items);

        const assembledItems = sortByInteractionOrder(
          itemIds.map((itemId) => ({
            item_id: itemId,
            interaction: interactionObj[itemId],
            metadata: itemsMap.get(itemId) ?? null,
          })),
        );

        return {
          _id: trx._id,
          user_id: trx.user_id,
          status: trx.status,
          assigned_by: trx.assigned_by ?? null,
          assigned_at: trx.assigned_at ?? null,
          annotated_at: trx.annotated_at ?? null,
          createdAt: trx.createdAt,
          updatedAt: trx.updatedAt,
          items: assembledItems,
        };
      }),
    );
  }
}
