import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { catchError, finalize, forkJoin, of, switchMap } from 'rxjs';
import { NotificationService } from '../../../../core/services/notification.service';
import { PageHeader } from '../../../../shared/components/page-header/page-header';
import { DataTable } from '../../../../shared/components/data-table/data-table';
import { EmptyState } from '../../../../shared/components/empty-state/empty-state';
import { Loading } from '../../../../shared/components/loading/loading';
import { FormatoReporte } from '../../../../models/exported-file.model';
import { Metric } from '../../../../models/metric.model';
import { ReportDetail, ReportSummary } from '../../../../models/report-detail.model';
import { EstadoSolicitud, TipoSolicitud } from '../../../../models/solicitud.model';
import { reportFormatLabel, requestTypeValue, statusLabel, statusValue } from '../../../../shared/utils/request-labels';
import { ReportsApiService } from '../../services/reports-api.service';

@Component({
  selector: 'app-reports-page',
  imports: [PageHeader, DataTable, EmptyState, Loading, ReactiveFormsModule],
  template: `
    <app-page-header eyebrow="Reportes" title="Reportes exportables" />

    <form [formGroup]="filterForm" class="filters reports-filters" (ngSubmit)="refresh()">
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
          <option [ngValue]="estados.EnRevision">En revision operativa</option>
          <option [ngValue]="estados.EnRevisionProveedor">En revision proveedor</option>
          <option [ngValue]="estados.PendienteDecisionFinalAdmin">Pendiente decision final</option>
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
      <label class="search reports-search">
        Buscar
        <input #reportSearch type="search" placeholder="Titulo o autor" (input)="setSearch($event)" />
      </label>
      <div class="filter-actions">
        <button type="submit" [disabled]="loading()">Actualizar</button>
        <button type="button" class="ghost" (click)="clearFilters(reportSearch)" [disabled]="loading()">Limpiar</button>
        <button type="button" class="secondary" (click)="generateAndDownload('csv')" [disabled]="generating() !== null">
          {{ generating() === 'csv' ? 'Generando CSV...' : 'Generar CSV' }}
        </button>
        <button type="button" class="secondary" (click)="generateAndDownload('pdf')" [disabled]="generating() !== null">
          {{ generating() === 'pdf' ? 'Generando PDF...' : 'Generar PDF' }}
        </button>
      </div>
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
                  <button type="button" (click)="download(report.id, 'csv')" [disabled]="downloading() === report.id + '-csv'">
                    {{ downloading() === report.id + '-csv' ? 'Descargando...' : 'CSV' }}
                  </button>
                  <button type="button" (click)="download(report.id, 'pdf')" [disabled]="downloading() === report.id + '-pdf'">
                    {{ downloading() === report.id + '-pdf' ? 'Descargando...' : 'PDF' }}
                  </button>
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
    `.reports-filters{display:grid;grid-template-columns:repeat(4,minmax(145px,1fr));gap:1rem;align-items:end;margin-bottom:1.5rem;border:1px solid #e2e8f0;border-radius:24px;background:#fff;padding:1rem;box-shadow:0 10px 28px rgba(15,23,42,.06);overflow:visible}
     label{display:grid;gap:.4rem;min-width:0;color:#334155;font-weight:900;font-size:.86rem}input,select{width:100%;min-width:0;border:1px solid #cbd5e1;border-radius:14px;background-color:#f8fafc;padding:.75rem;color:#0f172a}
     .reports-search{grid-column:span 2}.filter-actions{grid-column:1/-1;display:flex;gap:.75rem;flex-wrap:wrap;align-items:center;justify-content:flex-end;padding-top:.1rem}
     .metrics{display:grid;grid-template-columns:repeat(auto-fit,minmax(11rem,1fr));gap:1.5rem;margin-bottom:1.5rem}
     .metrics article{border:1px solid #e2e8f0;border-radius:24px;background:#fff;padding:1.5rem;box-shadow:0 12px 34px rgba(15,23,42,.06)}
     .metrics span,.metrics small{display:block;color:#64748b;font-weight:900;text-transform:uppercase;font-size:11px;letter-spacing:.12em}.metrics strong{display:block;margin:.45rem 0;color:#0f172a;font-size:2rem;font-weight:900}
     .actions{display:flex;gap:.65rem;flex-wrap:wrap}button{min-height:2.55rem;border:0;border-radius:14px;background:#0f172a;color:#fff;font-weight:900;padding:.7rem 1rem;cursor:pointer}button:disabled{cursor:not-allowed;opacity:.58}.secondary{background:#2563eb}.ghost{background:#f8fafc;color:#334155;border:1px solid #cbd5e1}
     @media(max-width:1180px){.reports-filters{grid-template-columns:repeat(2,minmax(0,1fr))}.reports-search{grid-column:1/-1}.filter-actions{justify-content:flex-start}.reports-filters button{min-height:2.6rem}}@media(max-width:760px){.reports-filters{grid-template-columns:1fr}.reports-search{grid-column:auto}.filter-actions{display:grid;grid-template-columns:1fr 1fr}.filter-actions button{width:100%}}@media(max-width:460px){.filter-actions{grid-template-columns:1fr}}`
  ]
})
export class ReportsPage implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly reportsApi = inject(ReportsApiService);
  private readonly notifications = inject(NotificationService);
  readonly estados = EstadoSolicitud;
  readonly tipos = TipoSolicitud;
  readonly formatos = FormatoReporte;
  readonly loading = signal(true);
  readonly generating = signal<'csv' | 'pdf' | null>(null);
  readonly downloading = signal<string | null>(null);
  readonly allReports = signal<ReportSummary[]>([]);
  readonly reports = signal<ReportSummary[]>([]);
  readonly metrics = signal<Metric[]>([]);
  readonly reportDetails = signal<Map<string, ReportDetail>>(new Map<string, ReportDetail>());
  readonly searchTerm = signal('');
  readonly filterForm = this.fb.group({
    startDate: [null as string | null],
    endDate: [null as string | null],
    status: [null as EstadoSolicitud | null],
    requestType: [null as TipoSolicitud | null]
  });

  ngOnInit(): void {
    this.filterForm.valueChanges.subscribe(() => this.applyLocalFilters());
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
      next: (reports) => {
        this.allReports.set(reports);
        this.reports.set(reports);
        this.loadReportDetails(reports);
      },
      error: () => this.loading.set(false),
      complete: () => this.loading.set(false)
    });
  }

  generateAndDownload(format: 'csv' | 'pdf'): void {
    const filter = this.filterForm.getRawValue();
    const title = `Reporte operativo ${new Date().toLocaleString()}`;
    this.generating.set(format);
    this.reportsApi.generateReport({ title, filter }).pipe(
      switchMap((report) => this.reportsApi.downloadReport(report.id, format)),
      finalize(() => this.generating.set(null))
    ).subscribe({
      next: () => {
        this.notifications.show(`Reporte ${format.toUpperCase()} generado y descargado.`, 'success');
        this.refresh();
      },
      error: () => this.notifications.show('No se pudo generar o descargar el reporte.', 'error')
    });
  }

  download(reportId: string, format: 'csv' | 'pdf'): void {
    this.downloading.set(`${reportId}-${format}`);
    this.reportsApi.downloadReport(reportId, format).pipe(
      finalize(() => this.downloading.set(null))
    ).subscribe({
      next: () => this.notifications.show(`Reporte ${format.toUpperCase()} descargado.`, 'success'),
      error: () => this.notifications.show('No se pudo descargar el reporte.', 'error')
    });
  }

  formatText = reportFormatLabel;
  statusText = statusLabel;

  setSearch(event: Event): void {
    this.searchTerm.set((event.target as HTMLInputElement).value);
    this.applyLocalFilters();
  }

  clearFilters(reportSearch: HTMLInputElement): void {
    this.filterForm.reset({
      startDate: null,
      endDate: null,
      status: null,
      requestType: null
    });
    this.searchTerm.set('');
    reportSearch.value = '';
    this.applyLocalFilters();
  }

  private loadReportDetails(reports: ReportSummary[]): void {
    if (reports.length === 0) {
      this.reportDetails.set(new Map<string, ReportDetail>());
      this.applyLocalFilters();
      return;
    }

    forkJoin(
      reports.map((report) =>
        this.reportsApi.getReportById(report.id).pipe(catchError(() => of(null)))
      )
    ).subscribe((details) => {
      this.reportDetails.set(
        new Map(
          details
            .filter((detail): detail is ReportDetail => detail !== null)
            .map((detail) => [detail.id, detail])
        )
      );
      this.applyLocalFilters();
    });
  }

  private applyLocalFilters(): void {
    const filter = this.filterForm.getRawValue();
    const search = this.searchTerm().trim().toLowerCase();
    const startDate = filter.startDate ? new Date(`${filter.startDate}T00:00:00`) : null;
    const endDate = filter.endDate ? new Date(`${filter.endDate}T23:59:59`) : null;
    const details = this.reportDetails();

    this.reports.set(
      this.allReports().filter((report) => {
        const generatedAt = report.generatedAt ? new Date(report.generatedAt) : null;
        const detail = details.get(report.id);
        const matchesStart = !startDate || (generatedAt !== null && generatedAt >= startDate);
        const matchesEnd = !endDate || (generatedAt !== null && generatedAt <= endDate);
        const reportStatus = statusValue(detail?.filter?.status);
        const reportType = requestTypeValue(detail?.filter?.requestType);
        const matchesStatus =
          filter.status === null ||
          filter.status === undefined ||
          reportStatus === null ||
          reportStatus === statusValue(filter.status);
        const matchesType =
          filter.requestType === null ||
          filter.requestType === undefined ||
          reportType === null ||
          reportType === requestTypeValue(filter.requestType);
        const text = `${report.title} ${report.generatedBy}`.toLowerCase();
        const matchesSearch = !search || text.includes(search);
        return matchesStart && matchesEnd && matchesStatus && matchesType && matchesSearch;
      })
    );
  }
}
