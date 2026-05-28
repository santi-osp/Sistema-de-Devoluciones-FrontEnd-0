import { Evidencia } from './evidencia.model';
import { RequestTimeline } from './request-timeline.model';

export enum TipoSolicitud {
  Devolucion = 1,
  Garantia = 2
}

export enum PreferenciaSolucion {
  Reembolso = 1,
  Cambio = 2,
  Reparacion = 3
}

export enum EstadoSolicitud {
  Creada = 1,
  EnRevision = 2,
  PendienteInformacion = 3,
  Aprobada = 4,
  Rechazada = 5,
  Cerrada = 6,
  EnRevisionProveedor = 7,
  PendienteDecisionFinalAdmin = 8
}

export interface Solicitud {
  id: string;
  customerId: string;
  orderId: string;
  productId: string;
  type: TipoSolicitud;
  status: EstadoSolicitud;
  reason: string;
  description: string;
  quantity: number;
  preferredSolution?: PreferenciaSolucion;
  createdAt: string;
}

export interface SolicitudDetalle extends Solicitud {
  preferredSolution: PreferenciaSolucion;
  evidence: Evidencia[];
  timeline: RequestTimeline[];
}
