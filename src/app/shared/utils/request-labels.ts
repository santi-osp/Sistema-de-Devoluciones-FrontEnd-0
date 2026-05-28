import { EstadoSolicitud, PreferenciaSolucion, TipoSolicitud } from '../../models/solicitud.model';
import { TipoEvidencia } from '../../models/evidencia.model';
import { FormatoReporte } from '../../models/exported-file.model';
import { EstadoAsignacionProveedor } from '../../models/provider-case.model';

const requestTypeMap: Record<string, TipoSolicitud> = {
  devolucion: TipoSolicitud.Devolucion,
  garantia: TipoSolicitud.Garantia
};

const statusMap: Record<string, EstadoSolicitud> = {
  creada: EstadoSolicitud.Creada,
  enrevision: EstadoSolicitud.EnRevision,
  pendienterevision: EstadoSolicitud.EnRevision,
  pendienteinformacion: EstadoSolicitud.PendienteInformacion,
  aprobada: EstadoSolicitud.Aprobada,
  rechazada: EstadoSolicitud.Rechazada,
  cerrada: EstadoSolicitud.Cerrada,
  enrevisionproveedor: EstadoSolicitud.EnRevisionProveedor,
  pendientedecisionfinaladmin: EstadoSolicitud.PendienteDecisionFinalAdmin
};

const solutionMap: Record<string, PreferenciaSolucion> = {
  reembolso: PreferenciaSolucion.Reembolso,
  cambio: PreferenciaSolucion.Cambio,
  reparacion: PreferenciaSolucion.Reparacion
};

const providerStatusMap: Record<string, EstadoAsignacionProveedor> = {
  asignado: EstadoAsignacionProveedor.Asignado,
  enevaluacion: EstadoAsignacionProveedor.EnEvaluacion,
  informacionsolicitada: EstadoAsignacionProveedor.InformacionSolicitada,
  dictaminado: EstadoAsignacionProveedor.Dictaminado,
  cerrado: EstadoAsignacionProveedor.Cerrado
};

function normalizeKey(value: unknown): string {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]/g, '')
    .toLowerCase();
}

function enumNumber<T extends number>(value: unknown, map: Record<string, T>): T | null {
  if (value === null || value === undefined || value === '') {
    return null;
  }

  if (typeof value === 'number' && Number.isFinite(value)) {
    return value as T;
  }

  const numeric = Number(value);
  if (Number.isFinite(numeric)) {
    return numeric as T;
  }

  return map[normalizeKey(value)] ?? null;
}

export function requestTypeValue(type: TipoSolicitud | number | string | null | undefined): TipoSolicitud | null {
  return enumNumber(type, requestTypeMap);
}

export function statusValue(status: EstadoSolicitud | number | string | null | undefined): EstadoSolicitud | null {
  return enumNumber(status, statusMap);
}

export function solutionValue(value: PreferenciaSolucion | number | string | null | undefined): PreferenciaSolucion | null {
  return enumNumber(value, solutionMap);
}

export function providerAssignmentStatusValue(
  status: EstadoAsignacionProveedor | number | string | null | undefined
): EstadoAsignacionProveedor | null {
  return enumNumber(status, providerStatusMap);
}

export function requestTypeLabel(type: TipoSolicitud | number | string): string {
  return requestTypeValue(type) === TipoSolicitud.Garantia ? 'Garantia' : 'Devolucion';
}

export function solutionLabel(value: PreferenciaSolucion | number | string): string {
  switch (solutionValue(value)) {
    case PreferenciaSolucion.Reembolso:
      return 'Reembolso';
    case PreferenciaSolucion.Reparacion:
      return 'Reparacion';
    default:
      return 'Cambio';
  }
}

export function statusLabel(status: EstadoSolicitud | number | string): string {
  switch (statusValue(status)) {
    case EstadoSolicitud.EnRevision:
      return 'En revision operativa';
    case EstadoSolicitud.PendienteInformacion:
      return 'Pendiente informacion';
    case EstadoSolicitud.Aprobada:
      return 'Aprobada';
    case EstadoSolicitud.Rechazada:
      return 'Rechazada';
    case EstadoSolicitud.Cerrada:
      return 'Cerrada';
    case EstadoSolicitud.EnRevisionProveedor:
      return 'En revision proveedor';
    case EstadoSolicitud.PendienteDecisionFinalAdmin:
      return 'Pendiente decision final';
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
