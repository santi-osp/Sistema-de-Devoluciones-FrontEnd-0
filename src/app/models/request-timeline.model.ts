import { EstadoSolicitud } from './solicitud.model';

export interface RequestTimeline {
  id: string;
  requestId: string;
  event: string;
  previousStatus?: EstadoSolicitud | null;
  newStatus?: EstadoSolicitud | null;
  createdAt: string;
  createdBy?: string | null;
}
