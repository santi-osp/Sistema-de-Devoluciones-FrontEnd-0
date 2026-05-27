import { EstadoSolicitud, PreferenciaSolucion, TipoSolicitud } from '../../models/solicitud.model';
import { TipoEvidencia } from '../../models/evidencia.model';
import { FormatoReporte } from '../../models/exported-file.model';

export function requestTypeLabel(type: TipoSolicitud | number): string {
  return Number(type) === TipoSolicitud.Garantia ? 'Garantia' : 'Devolucion';
}

export function solutionLabel(value: PreferenciaSolucion | number): string {
  switch (Number(value)) {
    case PreferenciaSolucion.Reembolso:
      return 'Reembolso';
    case PreferenciaSolucion.Reparacion:
      return 'Reparacion';
    default:
      return 'Cambio';
  }
}

export function statusLabel(status: EstadoSolicitud | number): string {
  switch (Number(status)) {
    case EstadoSolicitud.EnRevision:
      return 'En revision';
    case EstadoSolicitud.PendienteInformacion:
      return 'Pendiente informacion';
    case EstadoSolicitud.Aprobada:
      return 'Aprobada';
    case EstadoSolicitud.Rechazada:
      return 'Rechazada';
    case EstadoSolicitud.Cerrada:
      return 'Cerrada';
    default:
      return 'Creada';
  }
}

export function evidenceTypeForFile(file: File): TipoEvidencia {
  if (file.type.startsWith('image/')) {
    return TipoEvidencia.Imagen;
  }
  if (file.type.startsWith('video/')) {
    return TipoEvidencia.Video;
  }
  if (file.type === 'application/pdf') {
    return TipoEvidencia.Pdf;
  }
  return TipoEvidencia.Otro;
}

export function reportFormatLabel(format: FormatoReporte | number): string {
  return Number(format) === FormatoReporte.Pdf ? 'PDF' : 'CSV';
}
