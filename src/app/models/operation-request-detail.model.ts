import { Evidencia } from './evidencia.model';
import { InternalComment } from './internal-comment.model';
import { EstadoSolicitud, TipoSolicitud } from './solicitud.model';

export interface OperationRequestDetail {
  id: string;
  customerId: string;
  orderId: string;
  productId: string;
  type: TipoSolicitud;
  status: EstadoSolicitud;
  reason: string;
  description: string;
  quantity: number;
  evidence: Evidencia[];
  comments: InternalComment[];
}
