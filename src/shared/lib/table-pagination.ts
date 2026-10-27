import type { ApiListResponse, ApiMeta } from "@/shared/api/contracts";

/** Mínimo de filas por página en tablas de listado. */
export const TABLE_PAGE_SIZE = 10;

export function resolvePageSize(pageSize?: number): number {
  return Math.max(TABLE_PAGE_SIZE, pageSize ?? TABLE_PAGE_SIZE);
}

export function paginateSlice<T>(
  items: T[],
  page: number,
  pageSize?: number,
): ApiListResponse<T> {
  const size = resolvePageSize(pageSize);
  const totalItems = items.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / size));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = (safePage - 1) * size;
  return {
    data: items.slice(start, start + size),
    meta: {
      page: safePage,
      pageSize: size,
      totalItems,
      totalPages,
    } satisfies ApiMeta,
  };
}
