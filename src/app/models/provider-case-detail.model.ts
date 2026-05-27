import { ProviderCase } from './provider-case.model';
import { SolicitudDetalle } from './solicitud.model';

export interface ProviderCaseDetail extends ProviderCase {
  request: SolicitudDetalle;
}
