import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { EmptyState } from '../../../../shared/components/empty-state/empty-state';
import { FileUploader } from '../../../../shared/components/file-uploader/file-uploader';
import { Loading } from '../../../../shared/components/loading/loading';
import { PageHeader } from '../../../../shared/components/page-header/page-header';
import { StatusBadge } from '../../../../shared/components/status-badge/status-badge';
import { Evidencia } from '../../../../models/evidencia.model';
import { RequestTimeline } from '../../../../models/request-timeline.model';
import { SolicitudDetalle } from '../../../../models/solicitud.model';
import {
  evidenceTypeForFile,
  requestTypeLabel,
  solutionLabel,
  statusLabel
} from '../../../../shared/utils/request-labels';
import { formatFileSize } from '../../../../shared/utils/format-file-size';
import { NotificationService } from '../../../../core/services/notification.service';
import { EvidenceApiService } from '../../services/evidence-api.service';
import { RequestsApiService } from '../../services/requests-api.service';

@Component({
  selector: 'app-request-detail-page',
  imports: [PageHeader, StatusBadge, EmptyState, Loading, FileUploader],
  template: `
    <app-page-header eyebrow="Cliente" title="Detalle de solicitud" />

    @if (loading()) {
      <app-loading label="Consultando solicitud" />
    } @else if (!request()) {
      <app-empty-state title="Solicitud no encontrada" description="No fue posible cargar la solicitud solicitada." />
    } @else {
      <section class="detail-grid">
        <article class="panel">
          <div class="panel-title">
            <h2>{{ typeLabel(request()!.type) }}</h2>
            <app-status-badge [label]="statusText(request()!.status)" />
          </div>
          <dl>
            <div><dt>Motivo</dt><dd>{{ request()!.reason }}</dd></div>
            <div><dt>Descripcion</dt><dd>{{ request()!.description }}</dd></div>
            <div><dt>Cantidad</dt><dd>{{ request()!.quantity }}</dd></div>
            <div><dt>Preferencia</dt><dd>{{ solutionText(request()!.preferredSolution) }}</dd></div>
          </dl>
        </article>

        <article class="panel">
          <h2>Adjuntar evidencia</h2>
          <app-file-uploader (fileSelected)="selectFile($event)" />
          @if (selectedFile()) {
            <p class="file-name">{{ selectedFile()!.name }} · {{ fileSize(selectedFile()!.size) }}</p>
            <button type="button" (click)="upload()" [disabled]="uploading()">
              {{ uploading() ? 'Subiendo...' : 'Subir evidencia' }}
            </button>
          }
        </article>
      </section>

      <section class="panel">
        <h2>Timeline</h2>
        @if (timeline().length === 0) {
          <app-empty-state title="Sin eventos" description="El historial se mostrara cuando la solicitud cambie de estado." />
        } @else {
          <ol class="timeline">
            @for (item of timeline(); track item.id) {
              <li>
                <strong>{{ item.event }}</strong>
                <span>{{ item.createdAt }}</span>
                @if (item.newStatus) {
                  <small>{{ statusText(item.newStatus) }}</small>
                }
              </li>
            }
          </ol>
        }
      </section>

      <section class="panel">
        <h2>Evidencias</h2>
        @if (evidence().length === 0) {
          <app-empty-state title="Sin evidencias" description="Aun no hay archivos asociados a esta solicitud." />
        } @else {
          <div class="evidence-list">
            @for (item of evidence(); track item.id) {
              <article>
                <strong>{{ item.fileName }}</strong>
                <span>{{ fileSize(item.sizeInBytes) }}</span>
                @if (item.url) {
                  <a [href]="item.url" target="_blank" rel="noreferrer">Abrir</a>
                }
              </article>
            }
          </div>
        }
      </section>
    }
  `,
  styles: [
    `.detail-grid{display:grid;grid-template-columns:1.2fr .8fr;gap:1rem;margin-bottom:1rem}.panel{border:1px solid #e2e8f0;background:#fff;border-radius:8px;padding:1.25rem;box-shadow:0 14px 40px rgba(15,23,42,.06)}
     .panel-title{display:flex;align-items:center;justify-content:space-between;gap:1rem}h2{margin:0 0 1rem;color:#0f172a;font-size:1.15rem}dl{display:grid;gap:.75rem}dt{color:#64748b;font-weight:900;font-size:.78rem}dd{margin:.2rem 0 0;color:#0f172a}
     button{border:0;border-radius:8px;background:#2563eb;color:#fff;font-weight:900;padding:.75rem 1rem;cursor:pointer}.file-name{color:#475569;font-weight:800}
     .timeline{display:grid;gap:.75rem;margin:0;padding-left:1.25rem}.timeline li{padding-left:.4rem}.timeline span,.timeline small{display:block;color:#64748b;margin-top:.2rem}
     .evidence-list{display:grid;gap:.75rem}.evidence-list article{display:flex;align-items:center;justify-content:space-between;gap:1rem;border:1px solid #eef2f7;border-radius:8px;padding:.85rem;background:#f8fafc}
     a{color:#2563eb;font-weight:900}@media(max-width:860px){.detail-grid{grid-template-columns:1fr}.evidence-list article{display:grid}}`
  ]
})
export class RequestDetailPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly requestsApi = inject(RequestsApiService);
  private readonly evidenceApi = inject(EvidenceApiService);
  private readonly notifications = inject(NotificationService);

  readonly requestId = this.route.snapshot.paramMap.get('id') ?? '';
  readonly loading = signal(true);
  readonly uploading = signal(false);
  readonly request = signal<SolicitudDetalle | null>(null);
  readonly timeline = signal<RequestTimeline[]>([]);
  readonly evidence = signal<Evidencia[]>([]);
  readonly selectedFile = signal<File | null>(null);
  readonly hasRequest = computed(() => this.request() !== null);
  readonly typeLabel = requestTypeLabel;
  readonly statusText = statusLabel;
  readonly solutionText = solutionLabel;
  readonly fileSize = formatFileSize;

  ngOnInit(): void {
    this.reload();
  }

  selectFile(file: File): void {
    if (file.size <= 0) {
      this.notifications.show('El archivo esta vacio.', 'error');
      return;
    }

    this.selectedFile.set(file);
  }

  upload(): void {
    const file = this.selectedFile();
    if (!file) {
      return;
    }

    this.uploading.set(true);
    this.evidenceApi.uploadEvidence(this.requestId, file, evidenceTypeForFile(file)).subscribe({
      next: () => {
        this.selectedFile.set(null);
        this.loadEvidence();
      },
      error: () => this.uploading.set(false),
      complete: () => this.uploading.set(false)
    });
  }

  private reload(): void {
    this.requestsApi.getRequestById(this.requestId).subscribe({
      next: (request) => this.request.set(request),
      error: () => this.loading.set(false),
      complete: () => this.loading.set(false)
    });
    this.requestsApi.getTimeline(this.requestId).subscribe((timeline) => this.timeline.set(timeline));
    this.loadEvidence();
  }

  private loadEvidence(): void {
    this.evidenceApi.getEvidence(this.requestId).subscribe((evidence) => this.evidence.set(evidence));
  }
}
