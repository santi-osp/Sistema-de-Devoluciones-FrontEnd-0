import { PreferenciaSolucion } from './solicitud.model';
import { ResultadoDictamen } from './technical-report.model';

export interface ProviderReview {
  assignment?: ProviderAssignment | null;
  warrantyValidation?: ProviderWarrantyValidation | null;
  technicalReport?: ProviderTechnicalReport | null;
  availability: ProviderAvailability;
}

export interface ProviderAssignment {
  id: string;
  requestId: string;
  providerId: string;
  status: number;
  assignedBy: string;
  assignedAt: string;
}

export interface ProviderWarrantyValidation {
  id: string;
  requestId: string;
  productId: string;
  isWarrantyValid: boolean;
  reason?: string | null;
  validatedBy: string;
  validatedAt: string;
}

export interface ProviderTechnicalReport {
  id: string;
  requestId: string;
  result: ResultadoDictamen;
  technicalReason: string;
  observations: string;
  issuedBy: string;
  issuedAt: string;
}

export interface ProviderAvailability {
  evaluated: boolean;
  preferredSolution: PreferenciaSolucion;
  hasAvailability?: boolean | null;
  hasConflict: boolean;
  conflictReason?: string | null;
  conflictResolution?: string | null;
}
