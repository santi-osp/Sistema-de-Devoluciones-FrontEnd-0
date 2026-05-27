import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { PageHeader } from '../../../../shared/components/page-header/page-header';
import { DataTable } from '../../../../shared/components/data-table/data-table';
import { EmptyState } from '../../../../shared/components/empty-state/empty-state';
import { Loading } from '../../../../shared/components/loading/loading';
import { FormatoReporte } from '../../../../models/exported-file.model';
import { Metric } from '../../../../models/metric.model';
import { ReportSummary } from '../../../../models/report-detail.model';
import { EstadoSolicitud, TipoSolicitud } from '../../../../models/solicitud.model';
import { reportFormatLabel, statusLabel } from '../../../../shared/utils/request-labels';
import { ReportsApiService } from '../../services/reports-api.service';

@Component({
  selector: 'app-reports-page',
  imports: [PageHeader, DataTable, EmptyState, Loading, ReactiveFormsModule],
  template: `
    <app-page-header eyebrow="Reportes" title="Reportes exportables" />

    <form [formGroup]="filterForm" class="filters" (ngSubmit)="refresh()">
      <label>
        Desde
        <input type="date" formControlName="startDate" />
      </label>
      <label>
        Hasta
        <input type="date" formControlName="endDate" />
      </label>
      <label>
        Estado
        <select formControlName="status">
          <option [ngValue]="null">Todos</option>
          <option [ngValue]="estados.Creada">Creada</option>
          <option [ngValue]="estados.EnRevision">En revision</option>
          <option [ngValue]="estados.PendienteInformacion">Pendiente informacion</option>
          <option [ngValue]="estados.Aprobada">Aprobada</option>
          <option [ngValue]="estados.Rechazada">Rechazada</option>
          <option [ngValue]="estados.Cerrada">Cerrada</option>
        </select>
      </label>
      <label>
        Tipo
        <select formControlName="requestType">
          <option [ngValue]="null">Todos</option>
          <option [ngValue]="tipos.Devolucion">Devolucion</option>
          <option [ngValue]="tipos.Garantia">Garantia</option>
        </select>
      </label>
      <button type="submit">Actualizar</button>
      <button type="button" class="secondary" (click)="generate()">Generar reporte</button>
    </form>

    @if (loading()) {
      <app-loading label="Consultando reportes" />
    } @else {
      <section class="metrics">
        @for (metric of metrics(); track metric.name) {
          <article>
            <span>{{ metric.name }}</span>
            <strong>{{ metric.value }}</strong>
            <small>{{ metric.unit }}</small>
          </article>
        }
      </section>

      @if (reports().length === 0) {
        <app-empty-state title="Sin reportes" description="Los reportes se listaran desde la API y podran descargarse en CSV o PDF." />
      } @else {
      <app-data-table>
        <table>
          <thead>
            <tr>
              <th>Reporte</th>
              <th>Generado</th>
              <th>Metricas</th>
              <th>Exportar</th>
            </tr>
          </thead>
          <tbody>
            @for (report of reports(); track report.id) {
              <tr>
                <td>{{ report.title }}</td>
                <td>{{ report.generatedAt || '—' }}</td>
                <td>{{ report.metricCount }}</td>
                <td class="actions">
                  <button type="button" (click)="download(report.id, 'csv')">CSV</button>
                  <button type="button" (click)="download(report.id, 'pdf')">PDF</button>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </app-data-table>
      }
    }
  `,
  styles: [
    `.filters{display:grid;grid-template-columns:repeat(4,minmax(0,1fr)) auto auto;gap:.75rem;align-items:end;margin-bottom:1rem}
     label{display:grid;gap:.35rem;color:#334155;font-weight:900;font-size:.86rem}input,select{border:1px solid #cbd5e1;border-radius:8px;background:#fff;padding:.65rem;color:#0f172a}
     .metrics{display:grid;grid-template-columns:repeat(auto-fit,minmax(11rem,1fr));gap:1rem;margin-bottom:1rem}
     .metrics article{border:1px solid #e2e8f0;border-radius:8px;background:#fff;padding:1rem;box-shadow:0 12px 34px rgba(15,23,42,.06)}
     .metrics span,.metrics small{display:block;color:#64748b;font-weight:800}.metrics strong{display:block;margin:.4rem 0;color:#0f172a;font-size:1.8rem}
     .actions{display:flex;gap:.5rem}button{border:0;border-radius:8px;background:#0f172a;color:#fff;font-weight:900;padding:.65rem .8rem;cursor:pointer}.secondary{background:#2563eb}
     @media(max-width:980px){.filters{grid-template-columns:1fr 1fr}.filters button{min-height:2.6rem}}`
  ]
})
export class ReportsPage implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly reportsApi = inject(ReportsApiService);
  readonly estados = EstadoSolicitud;
  readonly tipos = TipoSolicitud;
  readonly formatos = FormatoReporte;
  readonly loading = signal(true);
  readonly reports = signal<ReportSummary[]>([]);
  readonly metrics = signal<Metric[]>([]);
  readonly filterForm = this.fb.group({
    startDate: [null as string | null],
    endDate: [null as string | null],
    status: [null as EstadoSolicitud | null],
    requestType: [null as TipoSolicitud | null]
  });

  ngOnInit(): void {
    this.refresh();
  }

  refresh(): void {
    this.loading.set(true);
    const filter = this.filterForm.getRawValue();
    this.reportsApi.getMetrics(filter).subscribe({
      next: (metrics) => this.metrics.set(metrics),
      error: () => this.metrics.set([])
    });
    this.reportsApi.getReports().subscribe({
      next: (reports) => this.reports.set(reports),
      error: () => this.loading.set(false),
      complete: () => this.loading.set(false)
    });
  }

  generate(): void {
    const filter = this.filterForm.getRawValue();
    const title = `Reporte operativo ${new Date().toLocaleString()}`;
    this.reportsApi.generateReport({ title, filter }).subscribe(() => this.refresh());
  }

  download(reportId: string, format: 'csv' | 'pdf'): void {
    this.reportsApi.downloadReport(reportId, format).subscribe();
  }

  formatText = reportFormatLabel;
  statusText = statusLabel;
}
