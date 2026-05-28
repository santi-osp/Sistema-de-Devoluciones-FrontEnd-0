import { Evidencia } from './evidencia.model';
import { InternalComment } from './internal-comment.model';
import { ProviderReview } from './provider-review.model';
import { EstadoSolicitud, PreferenciaSolucion, TipoSolicitud } from './solicitud.model';

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
  preferredSolution: PreferenciaSolucion;
  evidence: Evidencia[];
  comments: InternalComment[];
  providerReview?: ProviderReview | null;
}
