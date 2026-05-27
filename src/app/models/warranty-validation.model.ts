export interface WarrantyValidationRequest {
  requestId?: string;
  productId: string;
  isWarrantyValid: boolean;
  reason?: string | null;
}

export interface WarrantyValidationResult {
  id: string;
  requestId: string;
  productId: string;
  isWarrantyValid: boolean;
  reason?: string | null;
  validatedAt: string;
}
