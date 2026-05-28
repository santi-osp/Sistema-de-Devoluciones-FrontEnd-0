import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DataTable } from '../../../../shared/components/data-table/data-table';
import { EmptyState } from '../../../../shared/components/empty-state/empty-state';
import { Loading } from '../../../../shared/components/loading/loading';
import { PageHeader } from '../../../../shared/components/page-header/page-header';
import { StatusBadge } from '../../../../shared/components/status-badge/status-badge';
import { EstadoSolicitud, TipoSolicitud } from '../../../../models/solicitud.model';
import { OperationRequest } from '../../../../models/operation-request.model';
import { requestTypeLabel, requestTypeValue, statusLabel, statusValue } from '../../../../shared/utils/request-labels';
import { OperationApiService } from '../../services/operation-api.service';

@Component({
  selector: 'app-admin-requests-page',
  imports: [PageHeader, DataTable, EmptyState, Loading, StatusBadge, RouterLink],
  template: `
    <section class="feature-page">
      <app-page-header eyebrow="Operacion" title="Bandeja de solicitudes" />

      <section class="filters">
        <div class="filter-group">
          <button type="button" (click)="setStatus(null)" [class.active]="selectedStatus() === null">Todas</button>
          <button type="button" (click)="setStatus(estados.EnRevision)" [class.active]="selectedStatus() === estados.EnRevision">En revision</button>
          <button type="button" (click)="setStatus(estados.Aprobada)" [class.active]="selectedStatus() === estados.Aprobada">Aprobadas</button>
          <button type="button" (click)="setStatus(estados.Rechazada)" [class.active]="selectedStatus() === estados.Rechazada">Rechazadas</button>
        </div>
        <div class="filter-controls">
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
            <input #searchInput type="search" placeholder="Motivo, cliente o id" (input)="setSearch($event)" />
          </label>
          <label>
            Desde
            <input #startDateInput type="date" (input)="setStartDate($event)" />
          </label>
          <label>
            Hasta
            <input #endDateInput type="date" (input)="setEndDate($event)" />
          </label>
          <button type="button" class="ghost" (click)="clearFilters(typeFilter, searchInput, startDateInput, endDateInput)">Limpiar</button>
        </div>
      </section>

      @if (loading()) {
        <app-loading label="Consultando solicitudes" />
      } @else if (filteredRequests().length === 0) {
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
              @for (request of filteredRequests(); track request.id) {
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
    `.filters{display:grid;gap:1rem;margin-bottom:1.5rem;border:1px solid #e2e8f0;border-radius:24px;background:#fff;padding:1rem;box-shadow:0 10px 28px rgba(15,23,42,.06)}
     .filter-group,.filter-controls{display:flex;gap:.8rem;flex-wrap:wrap;align-items:end}.filter-group{padding-bottom:.85rem;border-bottom:1px solid #eef2f7}
     label{display:grid;gap:.35rem;color:#334155;font-size:.78rem;font-weight:900;text-transform:uppercase;letter-spacing:.08em}.search{min-width:min(18rem,100%);flex:1}
     input,select{min-height:2.55rem;border:1px solid #cbd5e1;border-radius:14px;background-color:#f8fafc;color:#0f172a;padding:.65rem .8rem;font-weight:800}
     button{min-height:2.55rem;border:1px solid #cbd5e1;border-radius:14px;background:#fff;color:#334155;font-weight:900;padding:.65rem 1rem;cursor:pointer}
     button.active,button:hover{background:#2563eb;border-color:#2563eb;color:#fff}.ghost{background:#f8fafc}a{color:#2563eb;font-weight:900}`
  ]
})
export class AdminRequestsPage implements OnInit {
  private readonly operationApi = inject(OperationApiService);

  readonly estados = EstadoSolicitud;
  readonly tipos = TipoSolicitud;
  readonly loading = signal(true);
  readonly selectedStatus = signal<EstadoSolicitud | null>(null);
  readonly selectedType = signal<TipoSolicitud | null>(null);
  readonly searchTerm = signal('');
  readonly startDate = signal<string | null>(null);
  readonly endDate = signal<string | null>(null);
  readonly requests = signal<OperationRequest[]>([]);
  readonly filteredRequests = computed(() => {
    const status = this.selectedStatus();
    const type = this.selectedType();
    const search = this.searchTerm().trim().toLowerCase();
    const start = this.startDate() ? new Date(`${this.startDate()}T00:00:00`) : null;
    const end = this.endDate() ? new Date(`${this.endDate()}T23:59:59`) : null;

    return this.requests().filter((request) => {
      const matchesStatus = status === null || statusValue(request.status) === statusValue(status);
      const matchesType = type === null || requestTypeValue(request.type) === requestTypeValue(type);
      const text = `${request.id} ${request.customerId} ${request.reason}`.toLowerCase();
      const matchesSearch = !search || text.includes(search);
      const createdAt = request.createdAt ? new Date(request.createdAt) : null;
      const matchesStart = !start || (createdAt !== null && createdAt >= start);
      const matchesEnd = !end || (createdAt !== null && createdAt <= end);
      return matchesStatus && matchesType && matchesSearch && matchesStart && matchesEnd;
    });
  });
  readonly typeLabel = requestTypeLabel;
  readonly statusText = statusLabel;

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.operationApi.getRequests(null).subscribe({
      next: (requests) => this.requests.set(requests),
      error: () => this.loading.set(false),
      complete: () => this.loading.set(false)
    });
  }

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

  setStartDate(event: Event): void {
    this.startDate.set((event.target as HTMLInputElement).value || null);
  }

  setEndDate(event: Event): void {
    this.endDate.set((event.target as HTMLInputElement).value || null);
  }

  clearFilters(
    typeFilter: HTMLSelectElement,
    searchInput: HTMLInputElement,
    startDateInput: HTMLInputElement,
    endDateInput: HTMLInputElement
  ): void {
    this.selectedStatus.set(null);
    this.selectedType.set(null);
    this.searchTerm.set('');
    this.startDate.set(null);
    this.endDate.set(null);
    typeFilter.value = '';
    searchInput.value = '';
    startDateInput.value = '';
    endDateInput.value = '';
  }
}
