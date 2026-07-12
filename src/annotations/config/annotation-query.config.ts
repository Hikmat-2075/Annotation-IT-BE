export const annotationQueryConfig = {
  searchableFields: ['transaction_id', 'bundles.reasoning', 'bundles.context'],
  bundleFilterFields: ['relation_type', 'correlation_status'],
  dateField: 'createdAt',
  defaultSort: {
    field: 'createdAt',
    direction: 'desc',
  },
} as const;
