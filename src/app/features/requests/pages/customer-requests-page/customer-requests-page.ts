import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PageHeader } from '../../../../shared/components/page-header/page-header';
import { DataTable } from '../../../../shared/components/data-table/data-table';
import { EmptyState } from '../../../../shared/components/empty-state/empty-state';
import { Loading } from '../../../../shared/components/loading/loading';
import { StatusBadge } from '../../../../shared/components/status-badge/status-badge';
import { EstadoSolicitud, Solicitud, TipoSolicitud } from '../../../../models/solicitud.model';
import { RequestsApiService } from '../../services/requests-api.service';
import { requestTypeLabel, requestTypeValue, statusLabel, statusValue } from '../../../../shared/utils/request-labels';

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
      <section class="filters">
        <div class="filter-group">
          <button type="button" (click)="setStatus(null)" [class.active]="selectedStatus() === null">Todas</button>
          <button type="button" (click)="setStatus(estados.EnRevision)" [class.active]="selectedStatus() === estados.EnRevision">En revision</button>
          <button type="button" (click)="setStatus(estados.Aprobada)" [class.active]="selectedStatus() === estados.Aprobada">Aprobadas</button>
          <button type="button" (click)="setStatus(estados.Rechazada)" [class.active]="selectedStatus() === estados.Rechazada">Rechazadas</button>
        </div>
        <label>
          Tipo
          <select #typeFilter (change)="setType($event)">
            <option value="">Todos</option>
            <option [value]="tipos.Devolucion">Devolucion</option>
            <option [value]="tipos.Garantia">Garantia</option>
          </select>
        </label>
        <label class="search">
          Buscar
          <input #searchInput type="search" placeholder="Motivo o id" (input)="setSearch($event)" />
        </label>
        <button type="button" class="ghost" (click)="clearFilters(typeFilter, searchInput)">Limpiar</button>
      </section>

      @if (filteredRequests().length === 0) {
        <app-empty-state title="Sin coincidencias" description="No hay solicitudes que coincidan con los filtros seleccionados." />
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
            @for (request of filteredRequests(); track request.id) {
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
    }
  `,
  styles: [
    `.filters{display:flex;gap:.8rem;flex-wrap:wrap;align-items:end;margin-bottom:1.25rem;border:1px solid #e2e8f0;border-radius:24px;background:#fff;padding:1rem;box-shadow:0 10px 28px rgba(15,23,42,.06)}
     .filter-group{display:flex;gap:.65rem;flex-wrap:wrap}.search{min-width:min(18rem,100%);flex:1}
     label{display:grid;gap:.35rem;color:#334155;font-size:.78rem;font-weight:900;text-transform:uppercase;letter-spacing:.08em}
     input,select{min-height:2.55rem;border:1px solid #cbd5e1;border-radius:14px;background-color:#f8fafc;color:#0f172a;padding:.65rem .8rem;font-weight:800}
     button{min-height:2.55rem;border:1px solid #cbd5e1;border-radius:14px;background:#fff;color:#334155;font-weight:900;padding:.65rem 1rem;cursor:pointer}
     button.active,button:hover{background:#2563eb;border-color:#2563eb;color:#fff}.ghost{background:#f8fafc}
     a{color:#2563eb;font-weight:900;text-decoration:none}a:hover{text-decoration:underline}`
  ]
})
export class CustomerRequestsPage implements OnInit {
  private readonly requestsApi = inject(RequestsApiService);

  readonly loading = signal(true);
  readonly requests = signal<Solicitud[]>([]);
  readonly estados = EstadoSolicitud;
  readonly tipos = TipoSolicitud;
  readonly selectedStatus = signal<EstadoSolicitud | null>(null);
  readonly selectedType = signal<TipoSolicitud | null>(null);
  readonly searchTerm = signal('');
  readonly filteredRequests = computed(() => {
    const status = this.selectedStatus();
    const type = this.selectedType();
    const search = this.searchTerm().trim().toLowerCase();

    return this.requests().filter((request) => {
      const matchesStatus = status === null || statusValue(request.status) === statusValue(status);
      const matchesType = type === null || requestTypeValue(request.type) === requestTypeValue(type);
      const text = `${request.id} ${request.reason}`.toLowerCase();
      return matchesStatus && matchesType && (!search || text.includes(search));
    });
  });

  ngOnInit(): void {
    this.requestsApi.getRequests().subscribe({
      next: (requests) => this.requests.set(requests),
      error: () => this.loading.set(false),
      complete: () => this.loading.set(false)
    });
  }

  typeLabel = requestTypeLabel;
  statusText = statusLabel;

  setStatus(status: EstadoSolicitud | null): void {
    this.selectedStatus.set(status);
  }

  setType(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.selectedType.set(value ? Number(value) as TipoSolicitud : null);
  }

  setSearch(event: Event): void {
    this.searchTerm.set((event.target as HTMLInputElement).value);
  }

  clearFilters(typeFilter: HTMLSelectElement, searchInput: HTMLInputElement): void {
    this.selectedStatus.set(null);
    this.selectedType.set(null);
    this.searchTerm.set('');
    typeFilter.value = '';
    searchInput.value = '';
  }
}
