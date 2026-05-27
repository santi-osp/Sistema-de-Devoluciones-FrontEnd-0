export enum ResultadoDictamen {
  Procede = 1,
  NoProcede = 2,
  RequiereRevisionAdicional = 3
}

export interface TechnicalReportRequest {
  requestId?: string;
  result: ResultadoDictamen;
  technicalReason: string;
  observations: string;
}

export interface TechnicalReportResult {
  id: string;
  requestId: string;
  result: ResultadoDictamen;
  technicalReason: string;
  observations: string;
  issuedAt: string;
}
