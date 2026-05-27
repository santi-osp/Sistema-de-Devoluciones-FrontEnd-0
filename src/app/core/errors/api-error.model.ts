export interface NormalizedApiError {
  message: string;
  status?: number;
  traceId?: string | null;
  errors: string[];
}
