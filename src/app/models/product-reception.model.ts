export interface ProductReceptionRequest {
  requestId?: string;
  address: string;
  shippingCost: number;
  currency: string;
  receivedAt: string;
}

export interface ProductReceptionResult {
  id: string;
  requestId: string;
  address: string;
  shippingCost: number;
  currency: string;
  receivedAt: string;
}
