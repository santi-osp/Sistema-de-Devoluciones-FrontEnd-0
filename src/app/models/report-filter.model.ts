import { EstadoSolicitud, TipoSolicitud } from './solicitud.model';

export interface ReportFilter {
  startDate?: string | null;
  endDate?: string | null;
  status?: EstadoSolicitud | null;
  requestType?: TipoSolicitud | null;
}

export interface GenerateReportRequest {
  title: string;
  filter: ReportFilter;
}
