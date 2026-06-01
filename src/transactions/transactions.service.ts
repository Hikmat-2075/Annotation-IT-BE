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

  async getTransactionDetail(id: string) {
    const trx = await this.transactionModel.findOne({ _id: id }).lean();

    if (!trx) {
      throw new NotFoundException('Transaction not found');
    }

    // list_of_interaction_items may be a Map or plain object depending on how mongoose returns it
    let interactionObj: Record<string, any> = {};

    if (!trx.list_of_interaction_items) {
      interactionObj = {};
    } else if (trx.list_of_interaction_items instanceof Map) {
      trx.list_of_interaction_items.forEach((v: any, k: string) => {
        interactionObj[k] = v;
      });
    } else {
      interactionObj = trx.list_of_interaction_items as any;
    }

    const itemIds = Object.keys(interactionObj);

    const items = await this.itemsModel.find({ _id: { $in: itemIds } }).lean();

    const itemsMap = new Map(items.map((it: any) => [it._id, it]));

    const assembled = itemIds.map((itemId) => ({
      item_id: itemId,
      interaction: interactionObj[itemId],
      metadata: itemsMap.get(itemId) ?? null,
    }));

    return {
      _id: trx._id,
      user_id: trx.user_id,
      status: trx.status,
      assigned_to: trx.assigned_to,
      assigned_at: trx.assigned_at,
      annotated_at: trx.annotated_at,
      items: assembled.sort(
        (a, b) =>
          (a.interaction?.order_number ?? 0) -
          (b.interaction?.order_number ?? 0),
      ),
    };
  }

  async getAllTransactions(query: {
    status?: string;
    page?: string;
    limit?: string;
  }) {
    const page = Number(query.page) > 0 ? Number(query.page) : 1;
    const limit = Number(query.limit) > 0 ? Number(query.limit) : 10;
    const skip = (page - 1) * limit;

    const filter: any = {};

    if (query.status) {
      filter.status = query.status;
    }

    const [data, total] = await Promise.all([
      this.transactionModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),

      this.transactionModel.countDocuments(filter),
    ]);

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
            assigned_to: annotatorId,
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
          assigned_to: annotatorId,
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

    return transaction;
  }

  async getAssignedTransactions(annotatorId: string) {
    const trxs = await this.transactionModel
      .find({
        assigned_to: annotatorId,
        status: TransactionStatus.ASSIGNED,
      })
      .sort({ assigned_at: -1 })
      .lean();

    return trxs;
  }
}
