export enum EstadoAsignacionProveedor {
  Asignado = 1,
  EnEvaluacion = 2,
  InformacionSolicitada = 3,
  Dictaminado = 4,
  Cerrado = 5
}

export interface ProviderCase {
  id: string;
  requestId: string;
  providerId: string;
  status: EstadoAsignacionProveedor;
  assignedAt: string;
}
