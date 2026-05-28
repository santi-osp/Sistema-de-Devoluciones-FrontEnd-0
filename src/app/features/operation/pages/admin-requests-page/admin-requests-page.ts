import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DataTable } from '../../../../shared/components/data-table/data-table';
import { EmptyState } from '../../../../shared/components/empty-state/empty-state';
import { Loading } from '../../../../shared/components/loading/loading';
import { PageHeader } from '../../../../shared/components/page-header/page-header';
import { StatusBadge } from '../../../../shared/components/status-badge/status-badge';
import { EstadoSolicitud } from '../../../../models/solicitud.model';
import { OperationRequest } from '../../../../models/operation-request.model';
import { requestTypeLabel, statusLabel } from '../../../../shared/utils/request-labels';
import { OperationApiService } from '../../services/operation-api.service';

@Component({
  selector: 'app-admin-requests-page',
  imports: [PageHeader, DataTable, EmptyState, Loading, StatusBadge, RouterLink],
  template: `
    <section class="feature-page">
      <app-page-header eyebrow="Operacion" title="Bandeja de solicitudes" />

      <section class="filters">
        <button type="button" (click)="load(null)" [class.active]="selectedStatus() === null">Todas</button>
        <button type="button" (click)="load(estados.Creada)" [class.active]="selectedStatus() === estados.Creada">Creadas</button>
        <button type="button" (click)="load(estados.EnRevisionProveedor)" [class.active]="selectedStatus() === estados.EnRevisionProveedor">Proveedor</button>
        <button type="button" (click)="load(estados.PendienteDecisionFinalAdmin)" [class.active]="selectedStatus() === estados.PendienteDecisionFinalAdmin">Decision final</button>
        <button type="button" (click)="load(estados.PendienteInformacion)" [class.active]="selectedStatus() === estados.PendienteInformacion">Pendiente info</button>
      </section>

      @if (loading()) {
        <app-loading label="Consultando solicitudes" />
      } @else if (requests().length === 0) {
        <app-empty-state title="Sin solicitudes" description="No hay solicitudes para el filtro seleccionado." />
      } @else {
        <app-data-table>
          <table>
            <thead>
              <tr>
                <th>Tipo</th>
                <th>Estado</th>
                <th>Motivo</th>
                <th>Cliente</th>
                <th>Creada</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              @for (request of requests(); track request.id) {
                <tr>
                  <td>{{ typeLabel(request.type) }}</td>
                  <td><app-status-badge [label]="statusText(request.status)" /></td>
                  <td>{{ request.reason }}</td>
                  <td>{{ request.customerId }}</td>
                  <td>{{ request.createdAt }}</td>
                  <td><a [routerLink]="['/admin/solicitudes', request.id]">Detalle</a></td>
                </tr>
              }
            </tbody>
          </table>
        </app-data-table>
      }
    </section>
  `,
  styles: [
    `.filters{display:flex;gap:.5rem;flex-wrap:wrap;margin-bottom:1.25rem}
     button{border:1px solid #cbd5e1;border-radius:14px;background:#fff;color:#334155;font-weight:900;padding:.65rem 1rem;cursor:pointer}
     button.active,button:hover{background:#2563eb;border-color:#2563eb;color:#fff}a{color:#2563eb;font-weight:900}`
  ]
})
export class AdminRequestsPage implements OnInit {
  private readonly operationApi = inject(OperationApiService);

  readonly estados = EstadoSolicitud;
  readonly loading = signal(true);
  readonly selectedStatus = signal<EstadoSolicitud | null>(null);
  readonly requests = signal<OperationRequest[]>([]);
  readonly typeLabel = requestTypeLabel;
  readonly statusText = statusLabel;

  ngOnInit(): void {
    this.load(null);
  }

  load(status: EstadoSolicitud | null): void {
    this.selectedStatus.set(status);
    this.loading.set(true);
    this.operationApi.getRequests(status).subscribe({
      next: (requests) => this.requests.set(requests),
      error: () => this.loading.set(false),
      complete: () => this.loading.set(false)
    });
  }
}
