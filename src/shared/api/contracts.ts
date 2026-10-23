/**
 * Contratos base para una futura API REST.
 * Las respuestas mock y adaptadores HTTP deben alinearse con estos tipos.
 */

export type ApiMeta = {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
};

export type ApiListResponse<T> = {
  data: T[];
  meta: ApiMeta;
};

export type ApiItemResponse<T> = {
  data: T;
};

export type ApiErrorBody = {
  code: string;
  message: string;
  details?: Record<string, string[]>;
};

export type ApiErrorResponse = {
  error: ApiErrorBody;
};

export type PaginationQuery = {
  page?: number;
  pageSize?: number;
  search?: string;
};
