import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PageHeader } from '../../../../shared/components/page-header/page-header';
import { CreateRequest } from '../../../../models/create-request.model';
import { PreferenciaSolucion, TipoSolicitud } from '../../../../models/solicitud.model';
import { SessionService } from '../../../../core/services/session.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { RequestsApiService } from '../../services/requests-api.service';

@Component({
  selector: 'app-create-request-page',
  imports: [PageHeader, ReactiveFormsModule],
  template: `
    <app-page-header eyebrow="Cliente" title="Nueva solicitud" />

    <form [formGroup]="form" (ngSubmit)="submit()" class="form-card">
      <label>
        Tipo de solicitud
        <select formControlName="type">
          <option [ngValue]="tipoSolicitud.Devolucion">Devolucion</option>
          <option [ngValue]="tipoSolicitud.Garantia">Garantia</option>
        </select>
      </label>

      <label>
        Motivo
        <input formControlName="reason" maxlength="220" placeholder="Describe el motivo principal" />
      </label>

      <label>
        Descripcion
        <textarea formControlName="description" rows="5" placeholder="Agrega contexto para el equipo operativo"></textarea>
      </label>

      <div class="grid">
        <label>
          Cantidad
          <input type="number" min="1" formControlName="quantity" />
        </label>

        <label>
          Preferencia
          <select formControlName="preferredSolution">
            <option [ngValue]="preferencia.Reembolso">Reembolso</option>
            <option [ngValue]="preferencia.Cambio">Cambio</option>
            <option [ngValue]="preferencia.Reparacion">Reparacion</option>
          </select>
        </label>
      </div>

      <button type="submit" [disabled]="submitting()">
        {{ submitting() ? 'Creando...' : 'Crear solicitud' }}
      </button>
    </form>
  `,
  styles: [
    `.form-card{max-width:48rem;border:1px solid #e2e8f0;background:#fff;border-radius:8px;padding:1.25rem;display:grid;gap:1rem;box-shadow:0 14px 40px rgba(15,23,42,.06)}
     label{display:grid;gap:.4rem;color:#334155;font-weight:900}input,select,textarea{border:1px solid #cbd5e1;border-radius:8px;padding:.75rem;background:#f8fafc;color:#0f172a}
     textarea{resize:vertical}.grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:1rem}
     button{justify-self:start;border:0;border-radius:8px;background:#2563eb;color:#fff;font-weight:900;padding:.8rem 1rem;cursor:pointer}
     button:disabled{opacity:.65;cursor:not-allowed}@media(max-width:720px){.grid{grid-template-columns:1fr}}`
  ]
})
export class CreateRequestPage {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly session = inject(SessionService);
  private readonly requestsApi = inject(RequestsApiService);
  private readonly notifications = inject(NotificationService);

  readonly tipoSolicitud = TipoSolicitud;
  readonly preferencia = PreferenciaSolucion;
  readonly submitting = signal(false);
  readonly orderId = this.route.snapshot.queryParamMap.get('orderId') ?? '';
  readonly productId = this.route.snapshot.queryParamMap.get('productId') ?? '';
  readonly form = this.fb.nonNullable.group({
    type: [Number(this.route.snapshot.queryParamMap.get('type') ?? TipoSolicitud.Devolucion), Validators.required],
    reason: ['', [Validators.required, Validators.maxLength(220)]],
    description: ['', [Validators.required, Validators.maxLength(2000)]],
    quantity: [1, [Validators.required, Validators.min(1)]],
    preferredSolution: [PreferenciaSolucion.Cambio, Validators.required]
  });

  submit(): void {
    if (this.form.invalid || !this.orderId || !this.productId) {
      this.form.markAllAsTouched();
      this.notifications.show('Completa los campos requeridos.', 'error');
      return;
    }

    const raw = this.form.getRawValue();
    const dto: CreateRequest = {
      customerId: this.session.currentUser()?.userId,
      orderId: this.orderId,
      productId: this.productId,
      type: raw.type,
      reason: raw.reason,
      description: raw.description,
      quantity: raw.quantity,
      preferredSolution: raw.preferredSolution,
      evidence: null
    };

    this.submitting.set(true);
    this.requestsApi.createRequest(dto).subscribe({
      next: (created) => this.router.navigate(['/cliente/solicitudes', created.id]),
      error: () => this.submitting.set(false),
      complete: () => this.submitting.set(false)
    });
  }
}
