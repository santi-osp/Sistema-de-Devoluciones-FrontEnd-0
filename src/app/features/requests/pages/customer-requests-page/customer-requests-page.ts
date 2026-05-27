import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PageHeader } from '../../../../shared/components/page-header/page-header';
import { DataTable } from '../../../../shared/components/data-table/data-table';
import { EmptyState } from '../../../../shared/components/empty-state/empty-state';
import { Loading } from '../../../../shared/components/loading/loading';
import { StatusBadge } from '../../../../shared/components/status-badge/status-badge';
import { Solicitud } from '../../../../models/solicitud.model';
import { RequestsApiService } from '../../services/requests-api.service';
import { requestTypeLabel, statusLabel } from '../../../../shared/utils/request-labels';

@Component({
  selector: 'app-customer-requests-page',
  imports: [PageHeader, DataTable, EmptyState, Loading, StatusBadge, RouterLink],
  template: `
    <app-page-header eyebrow="Cliente" title="Solicitudes" />

    @if (loading()) {
      <app-loading label="Consultando solicitudes" />
    } @else if (requests().length === 0) {
      <app-empty-state title="Sin solicitudes" description="Crea una solicitud desde un pedido para iniciar el flujo real." />
    } @else {
      <app-data-table>
        <table>
          <thead>
            <tr>
              <th>Tipo</th>
              <th>Estado</th>
              <th>Motivo</th>
              <th>Fecha</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            @for (request of requests(); track request.id) {
              <tr>
                <td>{{ typeLabel(request.type) }}</td>
                <td><app-status-badge [label]="statusText(request.status)" /></td>
                <td>{{ request.reason }}</td>
                <td>{{ request.createdAt }}</td>
                <td><a [routerLink]="['/cliente/solicitudes', request.id]">Detalle</a></td>
              </tr>
            }
          </tbody>
        </table>
      </app-data-table>
    }
  `
})
export class CustomerRequestsPage implements OnInit {
  private readonly requestsApi = inject(RequestsApiService);

  readonly loading = signal(true);
  readonly requests = signal<Solicitud[]>([]);

  ngOnInit(): void {
    this.requestsApi.getRequests().subscribe({
      next: (requests) => this.requests.set(requests),
      error: () => this.loading.set(false),
      complete: () => this.loading.set(false)
    });
  }

  typeLabel = requestTypeLabel;
  statusText = statusLabel;
}
