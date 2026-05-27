import { PreferenciaSolucion } from './solicitud.model';
import { ResultadoDictamen } from './technical-report.model';

export interface ProviderDecisionRequest {
  requestId?: string;
  preferredSolution: PreferenciaSolucion;
  technicalResult: ResultadoDictamen;
}

export interface ProviderDecisionResult {
  authorized: boolean;
}
