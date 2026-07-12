import { AnnotationHistoryQueryDto } from '../dto/annotation-history-query-dto';
import { annotationQueryConfig } from './annotation-query.config';

export const buildAnnotationFilter = (query: AnnotationHistoryQueryDto) => {
  const filter: any = {};

  if (query.transaction_id) {
    filter.transaction_id = query.transaction_id;
  }

  if (query.annotator_id) {
    filter.annotator_id = query.annotator_id;
  }

  for (const field of annotationQueryConfig.bundleFilterFields) {
    const value = query[field];

    if (value) {
      filter[`bundles.${field}`] = value;
    }
  }

  if (query.search) {
    const regex = new RegExp(query.search, 'i');

    filter.$or = annotationQueryConfig.searchableFields.map((field) => ({
      [field]: regex,
    }));
  }

  if (query.from || query.to) {
    filter[annotationQueryConfig.dateField] = {};

    if (query.from) {
      filter[annotationQueryConfig.dateField].$gte = new Date(query.from);
    }

    if (query.to) {
      filter[annotationQueryConfig.dateField].$lte = new Date(query.to);
    }
  }

  return filter;
};
