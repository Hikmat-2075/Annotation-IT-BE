import { TransactionQueryDto } from '../dto/transaction-query.dto';
import { transactionQueryConfig } from './transaction-query-config';
import { escapeRegExp, isSafeMongoPathSegment } from '../../common/utils';

export const buildTransactionFilter = (query: TransactionQueryDto) => {
  const filter: any = {};

  for (const field of transactionQueryConfig.filterableFields) {
    const value = query[field];

    if (value) {
      filter[field] = value;
    }
  }

  if (query.item_id) {
    filter[`list_of_interaction_items.${query.item_id}`] = { $exists: true };
  }

  if (query.search) {
    const regex = new RegExp(escapeRegExp(query.search), 'i');

    filter.$or = [
      ...transactionQueryConfig.searchableFields.map((field) => ({
        [field]: regex,
      })),
    ];

    if (isSafeMongoPathSegment(query.search)) {
      filter.$or.push({
        [`list_of_interaction_items.${query.search}`]: { $exists: true },
      });
    }
  }

  return filter;
};
