/** Standard LMS API envelope */
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  meta?: ApiMeta;
}

export interface ApiMeta {
  timestamp?: string;
  status_code?: number;
  pagination?: PaginationMeta;
  total?: number;
}

export interface PaginationMeta {
  current_page?: number;
  per_page?: number;
  total?: number;
  last_page?: number;
  from?: number | null;
  to?: number | null;
  page?: number;
  limit?: number;
  totalPages?: number;
}

export interface PaginatedList<T> {
  data: T[];
  meta?: ApiMeta;
}

export interface ApiErrorShape {
  message: string;
  code?: string;
  statusCode?: number;
  details?: Record<string, unknown>;
}
