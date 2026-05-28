import { DatePipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { NotificationService } from '../../../../core/services/notification.service';
import { ProviderCaseDetail } from '../../../../models/provider-case-detail.model';
import { ResultadoDictamen } from '../../../../models/technical-report.model';
import { EmptyState } from '../../../../shared/components/empty-state/empty-state';
import { EvidenceGallery } from '../../../../shared/components/evidence-gallery/evidence-gallery';
import { Loading } from '../../../../shared/components/loading/loading';
import { PageHeader } from '../../../../shared/components/page-header/page-header';
import { StatusBadge } from '../../../../shared/components/status-badge/status-badge';
import {
  requestTypeLabel,
  solutionLabel,
  statusLabel
} from '../../../../shared/utils/request-labels';
import { ProvidersApiService } from '../../services/providers-api.service';

@Component({
  selector: 'app-provider-case-detail-page',
  imports: [DatePipe, ReactiveFormsModule, RouterLink, PageHeader, Loading, EmptyState, StatusBadge, EvidenceGallery],
  template: `
    <app-page-header eyebrow="Proveedor" title="Detalle del caso" />

    @if (loading()) {
      <app-loading label="Consultando caso asignado" />
    } @else if (!detail()) {
      <app-empty-state
        title="Caso no encontrado"
        description="No fue posible cargar el caso o no esta asignado al proveedor autenticado."
      />
    } @else {
      <div class="toolbar">
        <a routerLink="/proveedor/casos">Volver a casos</a>
        <app-status-badge [label]="providerStatusText(detail()!.status)" [tone]="providerTone(detail()!.status)" />
      </div>

      <section class="grid">
        <article class="panel panel--span">
          <div class="headline">
            <div>
              <span>Solicitud {{ shortId(detail()!.requestId) }}</span>
              <h2>{{ requestType(detail()!.request.type) }} · {{ solution(detail()!.request.preferredSolution) }}</h2>
            </div>
            <app-status-badge [label]="requestStatus(detail()!.request.status)" />
          </div>
          <dl>
            <div><dt>Motivo</dt><dd>{{ detail()!.request.reason }}</dd></div>
            <div><dt>Descripcion</dt><dd>{{ detail()!.request.description || 'Sin descripcion' }}</dd></div>
            <div><dt>Cantidad</dt><dd>{{ detail()!.request.quantity }}</dd></div>
            <div><dt>Cliente</dt><dd>{{ detail()!.request.customerId }}</dd></div>
            <div><dt>Pedido</dt><dd>{{ detail()!.request.orderId }}</dd></div>
            <div><dt>Producto</dt><dd>{{ detail()!.request.productId }}</dd></div>
            <div><dt>Creada</dt><dd>{{ detail()!.request.createdAt | date: 'short' }}</dd></div>
          </dl>
        </article>

        <article class="panel">
          <h2>Validacion de garantia</h2>
          @if (detail()!.review.warrantyValidation) {
            <div class="summary-box">
              <strong>{{ detail()!.review.warrantyValidation!.isWarrantyValid ? 'Garantia vigente' : 'Garantia no vigente' }}</strong>
              <p>{{ detail()!.review.warrantyValidation!.reason || 'Sin observaciones' }}</p>
              <small>{{ detail()!.review.warrantyValidation!.validatedAt | date: 'short' }}</small>
            </div>
          } @else {
            <form [formGroup]="warrantyForm" class="stack" (ngSubmit)="validateWarranty()">
              <label class="check">
                <input type="checkbox" formControlName="isWarrantyValid" />
                Garantia vigente
              </label>
              <textarea
                formControlName="reason"
                rows="4"
                placeholder="Motivo si la garantia no esta vigente"
              ></textarea>
              <button type="submit">Registrar validacion</button>
            </form>
          }
        </article>

        <article class="panel">
          <h2>Dictamen tecnico</h2>
          @if (detail()!.review.technicalReport) {
            <div class="summary-box">
              <strong>{{ dictamenText(detail()!.review.technicalReport!.result) }}</strong>
              <p>{{ detail()!.review.technicalReport!.technicalReason || 'Sin motivo tecnico' }}</p>
              <p>{{ detail()!.review.technicalReport!.observations || 'Sin observaciones' }}</p>
              <small>{{ detail()!.review.technicalReport!.issuedAt | date: 'short' }}</small>
            </div>
          } @else {
            <form [formGroup]="reportForm" class="stack" (ngSubmit)="registerTechnicalReport()">
              <label>
                Resultado
                <select formControlName="result">
                  <option [ngValue]="dictamen.Procede">Da visto bueno</option>
                  <option [ngValue]="dictamen.NoProcede">No da visto bueno</option>
                  <option [ngValue]="dictamen.RequiereRevisionAdicional">
                    Requiere revision adicional
                  </option>
                </select>
              </label>
              <textarea
                formControlName="technicalReason"
                rows="3"
                placeholder="Motivo tecnico obligatorio si no procede"
              ></textarea>
              <textarea formControlName="observations" rows="3" placeholder="Observaciones"></textarea>
              <button type="submit">Registrar dictamen</button>
            </form>
          }
        </article>

        <article class="panel">
          <h2>Autorizaciones</h2>
          <div class="summary-box">
            <strong>{{ availabilityText(detail()!.review.availability.hasAvailability) }}</strong>
            <p>{{ detail()!.review.availability.conflictReason || 'Sin conflicto detectado' }}</p>
            @if (detail()!.review.availability.conflictResolution) {
              <p>{{ detail()!.review.availability.conflictResolution }}</p>
            }
          </div>
          <div class="actions">
            <button type="button" class="approve" (click)="authorizeRepair()">
              Autorizar reparacion
            </button>
            <button type="button" class="approve" (click)="authorizeReplacement()">
              Autorizar reemplazo
            </button>
          </div>
        </article>

        <article class="panel">
          <h2>Recepcion de producto</h2>
          <form [formGroup]="receptionForm" class="stack" (ngSubmit)="registerReception()">
            <input formControlName="address" placeholder="Direccion de recepcion" />
            <div class="split">
              <input type="number" min="0" step="0.01" formControlName="shippingCost" />
              <input formControlName="currency" maxlength="3" />
            </div>
            <input type="datetime-local" formControlName="receivedAt" />
            <button type="submit">Registrar recepcion</button>
          </form>
        </article>
      </section>

      <section class="panel">
        <h2>Evidencias de la solicitud</h2>
        @if (detail()!.request.evidence.length === 0) {
          <app-empty-state title="Sin evidencias" description="El cliente aun no ha adjuntado archivos." />
        } @else {
          <app-evidence-gallery [items]="detail()!.request.evidence" />
        }
      </section>
    }
  `,
  styles: [
    `.toolbar{display:flex;align-items:center;justify-content:space-between;margin-bottom:1.25rem}.toolbar a{color:#2563eb;font-weight:900;text-decoration:none}
     .grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:1.5rem;margin-bottom:1.5rem}.panel{border:1px solid #e2e8f0;background:#fff;border-radius:28px;padding:1.5rem;box-shadow:0 14px 40px rgba(15,23,42,.06);margin-bottom:1.5rem}.panel--span{grid-column:1/-1}
     .headline{display:flex;align-items:flex-start;justify-content:space-between;gap:1rem}.headline span,.hint{color:#64748b;font-weight:800}.hint{margin:.8rem 0 0;line-height:1.5}
     h2{margin:0 0 1rem;color:#0f172a;font-size:1.15rem;font-weight:900}dl{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:1rem}dt{color:#64748b;font-weight:900;font-size:.78rem;text-transform:uppercase;letter-spacing:.08em}dd{margin:.2rem 0 0;color:#0f172a;word-break:break-word;font-weight:700}
     .stack{display:grid;gap:.85rem}label{display:grid;gap:.4rem;color:#334155;font-weight:900;font-size:.86rem}.check{display:flex;gap:.5rem;align-items:center}
     textarea,input,select{border:1px solid #cbd5e1;border-radius:14px;padding:.8rem;background:#f8fafc;color:#0f172a;width:100%;box-sizing:border-box}.split{display:grid;grid-template-columns:1fr 6rem;gap:.6rem}
     button{border:0;border-radius:14px;background:#0f172a;color:#fff;font-weight:900;padding:.78rem 1rem;cursor:pointer}.actions{display:flex;gap:.6rem;flex-wrap:wrap}.approve{background:#16a34a}
     .summary-box{border:1px solid #e2e8f0;border-radius:16px;background:#f8fafc;padding:1rem;display:grid;gap:.35rem}.summary-box strong{color:#0f172a}.summary-box p{margin:0;color:#334155;line-height:1.45}.summary-box small{color:#64748b;font-weight:800}
     @media(max-width:920px){.grid,dl{grid-template-columns:1fr}}`
  ]
})
export class ProviderCaseDetailPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly fb = inject(FormBuilder);
  private readonly providersApi = inject(ProvidersApiService);
  private readonly notifications = inject(NotificationService);

  readonly caseId = this.route.snapshot.paramMap.get('id') ?? '';
  readonly loading = signal(true);
  readonly detail = signal<ProviderCaseDetail | null>(null);
  readonly dictamen = ResultadoDictamen;
  readonly requestType = requestTypeLabel;
  readonly requestStatus = statusLabel;
  readonly solution = solutionLabel;

  readonly warrantyForm = this.fb.nonNullable.group({
    isWarrantyValid: [true],
    reason: ['']
  });
  readonly reportForm = this.fb.nonNullable.group({
    result: [ResultadoDictamen.Procede, Validators.required],
    technicalReason: [''],
    observations: ['']
  });
  readonly receptionForm = this.fb.nonNullable.group({
    address: ['', [Validators.required, Validators.maxLength(300)]],
    shippingCost: [0, [Validators.required, Validators.min(0)]],
    currency: ['COP', [Validators.required, Validators.maxLength(3)]],
    receivedAt: [this.toInputDateTime(new Date()), Validators.required]
  });

  ngOnInit(): void {
    this.reload();
  }

  validateWarranty(): void {
    const raw = this.warrantyForm.getRawValue();
    if (!raw.isWarrantyValid && !raw.reason.trim()) {
      this.notifications.show('Indica el motivo cuando la garantia no esta vigente.', 'error');
      return;
    }

    const current = this.detail();
    if (!current) {
      return;
    }

    this.providersApi
      .validateWarranty(this.caseId, {
        productId: current.request.productId,
        isWarrantyValid: raw.isWarrantyValid,
        reason: raw.reason || null
      })
      .subscribe(() => {
        this.notifications.show('Validacion de garantia registrada.', 'success');
        this.reload();
      });
  }

  registerTechnicalReport(): void {
    const raw = this.reportForm.getRawValue();
    if (Number(raw.result) === ResultadoDictamen.NoProcede && !raw.technicalReason.trim()) {
      this.notifications.show('El motivo tecnico es obligatorio cuando no procede.', 'error');
      return;
    }

    this.providersApi
      .registerTechnicalReport(this.caseId, {
        result: raw.result,
        technicalReason: raw.technicalReason,
        observations: raw.observations
      })
      .subscribe(() => {
        this.notifications.show('Dictamen tecnico registrado.', 'success');
        this.reload();
      });
  }

  authorizeRepair(): void {
    if (!window.confirm('Confirmar autorizacion de reparacion?')) {
      return;
    }

    this.providersApi.authorizeRepair(this.caseId).subscribe((result) => {
      this.notifications.show(
        result.authorized ? 'Reparacion autorizada.' : 'La reparacion no fue autorizada por reglas del caso.',
        result.authorized ? 'success' : 'error'
      );
      this.reload();
    });
  }

  authorizeReplacement(): void {
    if (!window.confirm('Confirmar autorizacion de reemplazo?')) {
      return;
    }

    this.providersApi.authorizeReplacement(this.caseId).subscribe((result) => {
      this.notifications.show(
        result.authorized ? 'Reemplazo autorizado.' : 'El reemplazo no fue autorizado por reglas del caso.',
        result.authorized ? 'success' : 'error'
      );
      this.reload();
    });
  }

  registerReception(): void {
    if (this.receptionForm.invalid) {
      this.receptionForm.markAllAsTouched();
      return;
    }

    const raw = this.receptionForm.getRawValue();
    this.providersApi
      .registerReception(this.caseId, {
        address: raw.address,
        shippingCost: raw.shippingCost,
        currency: raw.currency.toUpperCase(),
        receivedAt: new Date(raw.receivedAt).toISOString()
      })
      .subscribe(() => {
        this.notifications.show('Recepcion registrada.', 'success');
        this.reload();
      });
  }

  providerStatusText(status: number): string {
    switch (Number(status)) {
      case 2:
        return 'En evaluacion';
      case 3:
        return 'Informacion solicitada';
      case 4:
        return 'Dictaminado';
      case 5:
        return 'Cerrado';
      default:
        return 'Asignado';
    }
  }

  providerTone(status: number): 'neutral' | 'ok' | 'warn' | 'danger' {
    if (Number(status) === 4) {
      return 'ok';
    }
    if (Number(status) === 3) {
      return 'warn';
    }
    if (Number(status) === 5) {
      return 'danger';
    }

    return 'neutral';
  }

  dictamenText(result: number): string {
    switch (Number(result)) {
      case ResultadoDictamen.NoProcede:
        return 'No da visto bueno';
      case ResultadoDictamen.RequiereRevisionAdicional:
        return 'Requiere revision adicional';
      default:
        return 'Da visto bueno';
    }
  }

  availabilityText(value?: boolean | null): string {
    if (value === true) {
      return 'Disponibilidad validada';
    }

    if (value === false) {
      return 'Sin disponibilidad';
    }

    return 'Disponibilidad sin evaluar';
  }

  shortId(id?: string | null): string {
    return id ? id.slice(0, 8) : '-';
  }

  private reload(): void {
    this.loading.set(true);
    this.providersApi.getCaseById(this.caseId).subscribe({
      next: (detail) => this.detail.set(detail),
      error: () => this.loading.set(false),
      complete: () => this.loading.set(false)
    });
  }

  private toInputDateTime(date: Date): string {
    const offset = date.getTimezoneOffset();
    const local = new Date(date.getTime() - offset * 60000);
    return local.toISOString().slice(0, 16);
  }
}
