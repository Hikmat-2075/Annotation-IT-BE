interface PaginationQuery {
  page?: string | number;
  limit?: string | number;
}

export const getPagination = (query: PaginationQuery) => {
  const page = Number(query.page) > 0 ? Number(query.page) : 1;
  const requestedLimit = Number(query.limit) > 0 ? Number(query.limit) : 10;
  const limit = Math.min(requestedLimit, 100);

  return {
    page,
    limit,
    skip: (page - 1) * limit,
  };
};
