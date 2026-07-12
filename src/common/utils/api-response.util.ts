export interface ApiResponseBody<T = unknown> {
  code: number;
  status: string;
  message: string | string[];
  pagination: unknown;
  data: T | null;
  errors: unknown;
}

export interface SuccessPayload<T = unknown> {
  success?: boolean;
  message?: string;
  data?: T;
  pagination?: unknown;
  meta?: unknown;
}

export const buildSuccessResponse = <T>(
  message: string,
  data?: T,
): { success: true; message: string; data?: T } => ({
  success: true,
  message,
  ...(data === undefined ? {} : { data }),
});

export const normalizeSuccessPayload = <T>(
  payload: T,
): {
  message: string;
  data: unknown;
  pagination: unknown;
} => {
  if (!payload || typeof payload !== 'object') {
    return {
      message: 'Success',
      data: payload,
      pagination: null,
    };
  }

  const responseBody = payload as SuccessPayload;
  const hasMessage = 'message' in responseBody;
  const hasData = 'data' in responseBody;
  const hasPagination = 'pagination' in responseBody;
  const hasMeta = 'meta' in responseBody;

  return {
    message: hasMessage ? String(responseBody.message) : 'Success',
    data: hasData ? responseBody.data : null,
    pagination: hasPagination
      ? responseBody.pagination
      : hasMeta
        ? responseBody.meta
        : null,
  };
};

export const buildApiResponse = <T>(
  code: number,
  status: string,
  message: string | string[],
  data: T | null,
  errors: unknown = null,
  pagination: unknown = null,
): ApiResponseBody<T> => ({
  code,
  status,
  message,
  pagination,
  data,
  errors,
});
