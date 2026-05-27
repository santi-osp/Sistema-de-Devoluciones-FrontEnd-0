export interface ApiResponse<T> {
  succeeded: boolean;
  data: T | null;
  message?: string | null;
  traceId?: string | null;
  errors?: ApiErrorItem[];
}

export interface ApiErrorItem {
  code?: string | null;
  message: string;
  field?: string | null;
}
