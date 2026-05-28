import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
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
      @if (pageError()) {
        <div class="form-alert">{{ pageError() }}</div>
      }

      @if (!orderId || !productId) {
        <div class="form-alert">
          Selecciona primero un producto desde Mis pedidos para crear la solicitud.
        </div>
      }

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
        @if (showFieldError('reason')) {
          <small>El motivo es obligatorio.</small>
        }
      </label>

      <label>
        Descripcion
        <textarea formControlName="description" rows="5" placeholder="Agrega contexto para el equipo operativo"></textarea>
        @if (showFieldError('description')) {
          <small>La descripcion es obligatoria.</small>
        }
      </label>

      <div class="grid">
        <label>
          Cantidad
          <input type="number" min="1" formControlName="quantity" />
          @if (showFieldError('quantity')) {
            <small>La cantidad debe ser mayor que cero.</small>
          }
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

      <button type="submit" [disabled]="submitting() || !orderId || !productId">
        {{ submitting() ? 'Creando...' : 'Crear solicitud' }}
      </button>
    </form>
  `,
  styles: [
    `.form-card{max-width:52rem;margin-inline:auto;border:1px solid #e2e8f0;background:#fff;border-radius:28px;padding:1.5rem;display:grid;gap:1rem;box-shadow:0 14px 40px rgba(15,23,42,.06)}
     label{display:grid;gap:.45rem;color:#334155;font-weight:900}input,select,textarea{border:1px solid #cbd5e1;border-radius:14px;padding:.8rem;background-color:#f8fafc;color:#0f172a}
     small{color:#dc2626;font-weight:800}.form-alert{border:1px solid #fecaca;border-radius:18px;background:#fef2f2;color:#991b1b;padding:.85rem 1rem;font-weight:900}
     textarea{resize:vertical}.grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:1rem}
     button{justify-self:start;border:0;border-radius:14px;background:#2563eb;color:#fff;font-weight:900;padding:.85rem 1.1rem;cursor:pointer;box-shadow:0 12px 28px rgba(37,99,235,.18)}
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
  readonly pageError = signal<string | null>(null);
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
    this.pageError.set(null);

    if (this.form.invalid || !this.orderId || !this.productId) {
      this.form.markAllAsTouched();
      const message = !this.orderId || !this.productId
        ? 'Selecciona primero un producto desde Mis pedidos.'
        : 'Completa los campos requeridos.';
      this.pageError.set(message);
      this.notifications.show(message, 'error');
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
      error: (error: unknown) => {
        this.pageError.set(this.errorMessage(error));
        this.submitting.set(false);
      },
      complete: () => this.submitting.set(false)
    });
  }

  showFieldError(controlName: 'reason' | 'description' | 'quantity'): boolean {
    const control = this.form.controls[controlName];
    return control.invalid && (control.touched || control.dirty);
  }

  private errorMessage(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      return error.error?.message ?? 'No se pudo crear la solicitud.';
    }

    if (error instanceof Error) {
      return error.message;
    }

    return 'No se pudo crear la solicitud.';
  }
}
