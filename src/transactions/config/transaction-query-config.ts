const transactionQueryConfig = {
  searchableFields: ['_id', 'user_id', 'assigned_by'],

  filterableFields: ['status', 'assigned_by', 'user_id'],

  dynamicItemSearch: true,

  orderableFields: [
    '_id',
    'user_id',
    'status',
    'assigned_by',
    'assigned_at',
    'annotated_at',
    'createdAt',
    'updatedAt',
  ],

  defaultSort: {
    field: 'createdAt',
    direction: 'desc',
  },
};

export default transactionQueryConfig;
