import { DatePipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { EmptyState } from '../../../../shared/components/empty-state/empty-state';
import { EvidenceGallery } from '../../../../shared/components/evidence-gallery/evidence-gallery';
import { Loading } from '../../../../shared/components/loading/loading';
import { PageHeader } from '../../../../shared/components/page-header/page-header';
import { StatusBadge } from '../../../../shared/components/status-badge/status-badge';
import { OperationRequestDetail } from '../../../../models/operation-request-detail.model';
import { EstadoSolicitud } from '../../../../models/solicitud.model';
import { NotificationService } from '../../../../core/services/notification.service';
import { formatFileSize } from '../../../../shared/utils/format-file-size';
import { requestTypeLabel, solutionLabel, statusLabel } from '../../../../shared/utils/request-labels';
import { OperationApiService } from '../../services/operation-api.service';

@Component({
  selector: 'app-admin-request-detail-page',
  imports: [DatePipe, PageHeader, StatusBadge, EmptyState, Loading, ReactiveFormsModule, EvidenceGallery],
  template: `
    <app-page-header eyebrow="Operacion" title="Detalle operativo" />

    @if (loading()) {
      <app-loading label="Consultando detalle" />
    } @else if (!detail()) {
      <app-empty-state title="Solicitud no encontrada" description="No fue posible cargar el detalle operativo." />
    } @else {
      <section class="grid">
        <article class="panel">
          <div class="headline">
            <h2>{{ typeLabel(detail()!.type) }}</h2>
            <app-status-badge [label]="statusText(detail()!.status)" />
          </div>
          <dl>
            <div><dt>Motivo</dt><dd>{{ detail()!.reason }}</dd></div>
            <div><dt>Descripcion</dt><dd>{{ detail()!.description }}</dd></div>
            <div><dt>Cantidad</dt><dd>{{ detail()!.quantity }}</dd></div>
            <div><dt>Solucion solicitada</dt><dd>{{ solutionText(detail()!.preferredSolution) }}</dd></div>
            <div><dt>Cliente</dt><dd>{{ detail()!.customerId }}</dd></div>
            <div><dt>Pedido</dt><dd>{{ detail()!.orderId }}</dd></div>
            <div><dt>Producto</dt><dd>{{ detail()!.productId }}</dd></div>
          </dl>
        </article>

        <article class="panel">
          <h2>Decision operativa</h2>
          @if (canSendToReview()) {
            <div [formGroup]="decisionForm" class="stack">
              <button type="button" class="review" (click)="sendToReview()">Enviar a revision</button>
              <textarea formControlName="reason" rows="3" placeholder="Motivo para rechazar"></textarea>
              <button type="button" class="reject" (click)="decide(false)">Rechazar</button>
            </div>
          } @else if (isWaitingProvider()) {
            <app-empty-state title="En revision del proveedor" description="La solicitud esta asignada y pendiente de respuesta del proveedor." />
          } @else if (canDecide()) {
            <form [formGroup]="decisionForm" class="stack">
              <textarea formControlName="reason" rows="4" placeholder="Motivo obligatorio"></textarea>
              <div class="actions">
                <button type="button" class="approve" (click)="decide(true)">Aprobar</button>
                <button type="button" class="reject" (click)="decide(false)">Rechazar</button>
              </div>
            </form>
          } @else {
            <app-empty-state title="Sin acciones disponibles" description="La solicitud ya tiene una decision registrada." />
          }
        </article>
      </section>

      @if (detail()!.providerReview; as review) {
        <section class="panel provider-review">
          <div class="headline">
            <h2>Revision proveedor</h2>
            @if (review.availability.hasConflict) {
              <app-status-badge label="Con conflicto" tone="warn" />
            } @else if (review.availability.evaluated) {
              <app-status-badge label="Evaluada" tone="ok" />
            } @else {
              <app-status-badge label="Pendiente" />
            }
          </div>

          <div class="review-grid">
            @if (review.assignment) {
              <article>
                <span>Proveedor asignado</span>
                <strong>{{ review.assignment.providerId }}</strong>
                <small>{{ providerStatusText(review.assignment.status) }} - {{ review.assignment.assignedAt | date: 'short' }}</small>
              </article>
            }

            @if (review.warrantyValidation) {
              <article>
                <span>Garantia</span>
                <strong>{{ review.warrantyValidation.isWarrantyValid ? 'Vigente' : 'No vigente' }}</strong>
                <small>{{ review.warrantyValidation.reason || 'Sin observaciones' }}</small>
              </article>
            }

            @if (review.technicalReport) {
              <article>
                <span>Dictamen</span>
                <strong>{{ dictamenText(review.technicalReport.result) }}</strong>
                <small>{{ review.technicalReport.observations || review.technicalReport.technicalReason || 'Sin observaciones' }}</small>
              </article>
            }

            <article>
              <span>Disponibilidad</span>
              <strong>{{ availabilityText(review.availability.hasAvailability) }}</strong>
              <small>{{ solutionText(review.availability.preferredSolution) }}</small>
            </article>
          </div>

          @if (review.availability.conflictReason) {
            <div class="resolution">
              <strong>Conflicto detectado</strong>
              <p>{{ review.availability.conflictReason }}</p>
            </div>
          }

          @if (review.availability.conflictResolution) {
            <div class="resolution">
              <strong>Resolucion de conflicto</strong>
              <p>{{ review.availability.conflictResolution }}</p>
            </div>
          }
        </section>
      }

      <section class="grid">
        <article class="panel">
          <h2>Comentario interno</h2>
          <form [formGroup]="commentForm" class="stack" (ngSubmit)="addComment()">
            <textarea formControlName="text" rows="4" placeholder="Comentario para el equipo"></textarea>
            <label class="check">
              <input type="checkbox" formControlName="visibleToCustomer" />
              Visible para cliente
            </label>
            <button type="submit">Agregar comentario</button>
          </form>
        </article>

        <article class="panel">
          <h2>Solicitar informacion</h2>
          @if (canRequestInformation()) {
            <form [formGroup]="infoForm" class="stack" (ngSubmit)="requestInformation()">
              <textarea formControlName="message" rows="4" placeholder="Mensaje para el cliente"></textarea>
              <input type="datetime-local" formControlName="deadline" />
              <button type="submit">Solicitar informacion</button>
            </form>
          } @else {
            <app-empty-state title="No disponible" description="La solicitud no permite solicitar informacion en este estado." />
          }
        </article>
      </section>

      <section class="panel">
        <h2>Comentarios</h2>
        @if (detail()!.comments.length === 0) {
          <app-empty-state title="Sin comentarios" description="Aun no hay comentarios internos registrados." />
        } @else {
          <div class="list">
            @for (comment of detail()!.comments; track comment.id) {
              <article>
                <strong>{{ comment.author }}</strong>
                <p>{{ comment.text }}</p>
                <span>Visible cliente: {{ comment.visibleToCustomer ? 'Si' : 'No' }} · {{ comment.createdAt }}</span>
              </article>
            }
          </div>
        }
      </section>

      <section class="panel">
        <h2>Evidencias</h2>
        @if (detail()!.evidence.length === 0) {
          <app-empty-state title="Sin evidencias" description="La solicitud no tiene archivos adjuntos." />
        } @else {
          <app-evidence-gallery [items]="detail()!.evidence" />
        }
      </section>
    }
  `,
  styles: [
    `.grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:1.5rem;margin-bottom:1.5rem}.panel{border:1px solid #e2e8f0;background:#fff;border-radius:28px;padding:1.5rem;box-shadow:0 14px 40px rgba(15,23,42,.06);margin-bottom:1.5rem}
     .headline{display:flex;align-items:center;justify-content:space-between;gap:1rem}h2{margin:0 0 1rem;color:#0f172a;font-size:1.15rem;font-weight:900}dl{display:grid;gap:.8rem}dt{color:#64748b;font-weight:900;font-size:.78rem;text-transform:uppercase;letter-spacing:.08em}dd{margin:.2rem 0 0;color:#0f172a;word-break:break-word;font-weight:700}
     .stack{display:grid;gap:.85rem}textarea,input{border:1px solid #cbd5e1;border-radius:14px;padding:.8rem;background:#f8fafc;color:#0f172a}.check{display:flex;gap:.5rem;align-items:center;color:#334155;font-weight:800}
     button{border:0;border-radius:14px;background:#2563eb;color:#fff;font-weight:900;padding:.75rem 1rem;cursor:pointer}.actions{display:flex;gap:.6rem}.approve{background:#16a34a}.reject{background:#dc2626}.review{background:#0f172a}
     .list{display:grid;gap:.75rem}.list article{border:1px solid #eef2f7;border-radius:18px;background:#f8fafc;padding:1rem}.list p{margin:.4rem 0;color:#334155}.list span{color:#64748b;font-size:.88rem}.review-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:.75rem}.review-grid article{border:1px solid #e2e8f0;border-radius:16px;background:#f8fafc;padding:1rem;display:grid;gap:.35rem}.review-grid span{color:#64748b;font-weight:900;font-size:.75rem;text-transform:uppercase}.review-grid strong{color:#0f172a;word-break:break-word}.review-grid small{color:#475569;line-height:1.4}.resolution{border-left:4px solid #2563eb;background:#eff6ff;border-radius:14px;padding:1rem;margin-top:1rem}.resolution strong{color:#0f172a}.resolution p{margin:.35rem 0 0;color:#334155;line-height:1.5}a{color:#2563eb;font-weight:900}@media(max-width:860px){.grid,.review-grid{grid-template-columns:1fr}}`
  ]
})
export class AdminRequestDetailPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly fb = inject(FormBuilder);
  private readonly operationApi = inject(OperationApiService);
  private readonly notifications = inject(NotificationService);

  readonly requestId = this.route.snapshot.paramMap.get('id') ?? '';
  readonly loading = signal(true);
  readonly detail = signal<OperationRequestDetail | null>(null);
  readonly typeLabel = requestTypeLabel;
  readonly statusText = statusLabel;
  readonly solutionText = solutionLabel;
  readonly fileSize = formatFileSize;
  readonly commentForm = this.fb.nonNullable.group({
    text: ['', [Validators.required, Validators.maxLength(1000)]],
    visibleToCustomer: [false]
  });
  readonly infoForm = this.fb.nonNullable.group({
    message: ['', [Validators.required, Validators.maxLength(1000)]],
    deadline: ['', Validators.required]
  });
  readonly decisionForm = this.fb.nonNullable.group({
    reason: ['', [Validators.required, Validators.maxLength(1000)]]
  });

  ngOnInit(): void {
    this.reload();
  }

  addComment(): void {
    if (this.commentForm.invalid) {
      this.commentForm.markAllAsTouched();
      return;
    }

    this.operationApi.addComment(this.requestId, this.commentForm.getRawValue()).subscribe(() => {
      this.commentForm.reset({ text: '', visibleToCustomer: false });
      this.reload();
    });
  }

  requestInformation(): void {
    if (this.infoForm.invalid) {
      this.infoForm.markAllAsTouched();
      return;
    }

    const raw = this.infoForm.getRawValue();
    this.operationApi
      .requestInformation(this.requestId, {
        message: raw.message,
        deadline: new Date(raw.deadline).toISOString()
      })
      .subscribe(() => {
        this.infoForm.reset({ message: '', deadline: '' });
        this.reload();
      });
  }

  canSendToReview(): boolean {
    const status = this.detail()?.status;
    return status === EstadoSolicitud.Creada || status === EstadoSolicitud.PendienteInformacion;
  }

  canDecide(): boolean {
    const status = this.detail()?.status;
    return status === EstadoSolicitud.PendienteDecisionFinalAdmin || status === EstadoSolicitud.EnRevision;
  }

  canRequestInformation(): boolean {
    const status = this.detail()?.status;
    return (
      status === EstadoSolicitud.Creada ||
      status === EstadoSolicitud.EnRevision
    );
  }

  isWaitingProvider(): boolean {
    return this.detail()?.status === EstadoSolicitud.EnRevisionProveedor;
  }

  sendToReview(): void {
    if (!window.confirm('Enviar esta solicitud a revision?')) {
      return;
    }

    this.operationApi.sendToReview(this.requestId).subscribe(() => {
      this.notifications.show('Solicitud enviada a revision.', 'success');
      this.reload();
    });
  }

  decide(approved: boolean): void {
    if (this.decisionForm.invalid) {
      this.decisionForm.markAllAsTouched();
      return;
    }

    const action = approved ? 'aprobar' : 'rechazar';
    if (!window.confirm(`Confirmar ${action} esta solicitud?`)) {
      return;
    }

    const request = { reason: this.decisionForm.getRawValue().reason };
    const operation = approved
      ? this.operationApi.approveRequest(this.requestId, request)
      : this.operationApi.rejectRequest(this.requestId, request);

    operation.subscribe(() => {
      this.notifications.show('Decision registrada.', 'success');
      this.decisionForm.reset({ reason: '' });
      this.reload();
    });
  }

  private reload(): void {
    this.loading.set(true);
    this.operationApi.getRequestById(this.requestId).subscribe({
      next: (detail) => this.detail.set(detail),
      error: () => this.loading.set(false),
      complete: () => this.loading.set(false)
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

  dictamenText(result: number): string {
    switch (Number(result)) {
      case 2:
        return 'No da visto bueno';
      case 3:
        return 'Requiere revision adicional';
      default:
        return 'Da visto bueno';
    }
  }

  availabilityText(value?: boolean | null): string {
    if (value === true) {
      return 'Disponible';
    }

    if (value === false) {
      return 'No disponible';
    }

    return 'Sin evaluar';
  }
}
