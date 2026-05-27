import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Transactions } from './schemas/transaction.schema';
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
    const annotator = await this.annotatorModel
      .findById(annotatorId)
      .select('-password');

    if (!annotator) {
      throw new NotFoundException('Annotator not found');
    }

    const currentBatchIds = annotator.current_batch ?? [];

    if (currentBatchIds.length > 0) {
      return this.transactionModel
        .find({ _id: { $in: currentBatchIds } })
        .lean();
    }

    const completedTasks = annotator.completed_tasks ?? [];

    const transactions = await this.transactionModel.aggregate([
      {
        $match: {
          _id: {
            $nin: completedTasks,
          },
        },
      },
      {
        $sample: {
          size: 10,
        },
      },
    ]);

    const selectedIds = transactions.map((trx) => trx._id);

    annotator.current_batch = selectedIds;
    await annotator.save();

    return transactions;
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
      items: assembled,
    };
  }

  async getAllTransactions() {
    const trxs = await this.transactionModel.find().lean();

    // collect all unique item ids across transactions
    const allItemIds = new Set<string>();

    const trxInteractionMaps: Record<string, Record<string, any>> = {};

    for (const trx of trxs) {
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

      trxInteractionMaps[trx._id] = interactionObj;

      for (const key of Object.keys(interactionObj)) {
        allItemIds.add(key);
      }
    }

    const itemIdsArray = Array.from(allItemIds);

    const items = itemIdsArray.length
      ? await this.itemsModel.find({ _id: { $in: itemIdsArray } }).lean()
      : [];

    const itemsMap = new Map(items.map((it: any) => [String(it._id), it]));

    const data = trxs.map((trx) => {
      const interactionObj = trxInteractionMaps[trx._id] ?? {};
      const itemIds = Object.keys(interactionObj);

      const assembled = itemIds.map((itemId) => ({
        item_id: itemId,
        interaction: interactionObj[itemId],
        metadata: itemsMap.get(itemId) ?? null,
      }));

      return {
        _id: trx._id,
        user_id: trx.user_id,
        items: assembled,
      };
    });

    const meta = {
      total: trxs.length,
    };

    return { data, meta };
  }

  async getAssignedTransactions(annotatorId: string) {
    const annotator = await this.annotatorModel
      .findById(annotatorId)
      .select('-password')
      .lean();

    if (!annotator) {
      throw new NotFoundException('Annotator not found');
    }

    const currentBatchIds: string[] = annotator.current_batch ?? [];

    if (!currentBatchIds.length) {
      return { data: [], meta: { total: 0 } };
    }

    const trxs = await this.transactionModel
      .find({ _id: { $in: currentBatchIds } })
      .lean();

    // collect item ids across these transactions
    const allItemIds = new Set<string>();
    const trxInteractionMaps: Record<string, Record<string, any>> = {};

    for (const trx of trxs) {
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

      trxInteractionMaps[trx._id] = interactionObj;

      for (const key of Object.keys(interactionObj)) {
        allItemIds.add(key);
      }
    }

    const itemIdsArray = Array.from(allItemIds);

    const items = itemIdsArray.length
      ? await this.itemsModel.find({ _id: { $in: itemIdsArray } }).lean()
      : [];

    const itemsMap = new Map(items.map((it: any) => [String(it._id), it]));

    const data = trxs.map((trx) => {
      const interactionObj = trxInteractionMaps[trx._id] ?? {};
      const itemIds = Object.keys(interactionObj);

      const assembled = itemIds.map((itemId) => ({
        item_id: itemId,
        interaction: interactionObj[itemId],
        metadata: itemsMap.get(itemId) ?? null,
      }));

      return {
        _id: trx._id,
        user_id: trx.user_id,
        items: assembled,
      };
    });

    const meta = { total: data.length };

    return { data, meta };
  }
}
