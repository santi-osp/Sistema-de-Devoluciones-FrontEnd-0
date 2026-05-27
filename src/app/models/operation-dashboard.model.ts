import { OperationRequest } from './operation-request.model';

export interface OperationDashboard {
  totalOpen: number;
  pendingInformation: number;
  inReview: number;
  approved: number;
  rejected: number;
  recentRequests: OperationRequest[];
}
