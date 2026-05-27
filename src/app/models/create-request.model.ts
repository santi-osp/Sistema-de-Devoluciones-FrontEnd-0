import { PreferenciaSolucion, TipoSolicitud } from './solicitud.model';

export interface CreateRequest {
  customerId?: string;
  orderId: string;
  productId: string;
  type: TipoSolicitud;
  reason: string;
  description: string;
  quantity: number;
  preferredSolution: PreferenciaSolucion;
  evidence?: unknown[] | null;
}
