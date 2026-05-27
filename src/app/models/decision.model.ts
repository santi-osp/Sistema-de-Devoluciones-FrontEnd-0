export interface DecisionRequest {
  reason: string;
}

export interface DecisionResult {
  decisionId: string;
  requestId: string;
  approved: boolean;
  reason: string;
  decidedAt: string;
}
