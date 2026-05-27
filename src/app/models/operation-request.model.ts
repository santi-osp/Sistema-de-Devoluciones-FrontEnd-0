import { EstadoSolicitud, TipoSolicitud } from './solicitud.model';

export interface OperationRequest {
  id: string;
  customerId: string;
  type: TipoSolicitud;
  status: EstadoSolicitud;
  reason: string;
  createdAt: string;
}
