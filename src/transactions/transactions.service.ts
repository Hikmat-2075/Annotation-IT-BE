import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Transactions } from './schemas/transaction.schema';
import { Items } from '../items/schemas/item.schema';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectModel(Transactions.name)
    private readonly transactionModel: Model<Transactions>,
    @InjectModel(Items.name)
    private readonly itemsModel: Model<Items>,
  ) {}

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
}
