import { ProviderCase } from './provider-case.model';
import { ProviderReview } from './provider-review.model';
import { SolicitudDetalle } from './solicitud.model';

export interface ProviderCaseDetail extends ProviderCase {
  request: SolicitudDetalle;
  review: ProviderReview;
}
