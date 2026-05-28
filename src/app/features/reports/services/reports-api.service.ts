import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { API_BASE_URL } from '../../../core/config/api.config';
import { ApiResponse } from '../../../models/api-response.model';
import { DownloadedReportFile, FormatoReporte } from '../../../models/exported-file.model';
import { Metric } from '../../../models/metric.model';
import { GenerateReportRequest, ReportFilter } from '../../../models/report-filter.model';
import { ReportDetail, ReportSummary } from '../../../models/report-detail.model';

@Injectable({ providedIn: 'root' })
export class ReportsApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${API_BASE_URL}/reports`;

  generateReport(request: GenerateReportRequest): Observable<ReportDetail> {
    return this.http.post<ApiResponse<ReportDetail>>(`${this.baseUrl}/generate`, request).pipe(
      map((response) => {
        if (!response.data) {
          throw new Error(response.message ?? 'No se pudo generar el reporte.');
        }

        return response.data;
      })
    );
  }

  getReports(): Observable<ReportSummary[]> {
    return this.http
      .get<ApiResponse<ReportSummary[]>>(this.baseUrl)
      .pipe(map((response) => response.data ?? []));
  }

  getReportById(id: string): Observable<ReportDetail | null> {
    return this.http
      .get<ApiResponse<ReportDetail>>(`${this.baseUrl}/${id}`)
      .pipe(map((response) => response.data));
  }

  getMetrics(filter: ReportFilter = {}): Observable<Metric[]> {
    const params = this.cleanParams(filter);

    return this.http
      .get<ApiResponse<Metric[]>>(`${this.baseUrl}/metrics`, { params })
      .pipe(map((response) => response.data ?? []));
  }

  exportReport(reportId: string, format: 'csv' | 'pdf'): Observable<DownloadedReportFile> {
    const formatValue = format === 'pdf' ? FormatoReporte.Pdf : FormatoReporte.Csv;

    return this.http
      .get(`${this.baseUrl}/${reportId}/export`, {
        params: { format: String(formatValue) },
        responseType: 'blob',
        observe: 'response'
      })
      .pipe(
        map((response) => ({
          blob: response.body ?? new Blob(),
          fileName:
            this.getFileName(response.headers.get('content-disposition')) ??
            `reporte-${reportId}.${format}`,
          contentType: response.headers.get('content-type') ?? response.body?.type ?? ''
        }))
      );
  }

  downloadReport(reportId: string, format: 'csv' | 'pdf'): Observable<DownloadedReportFile> {
    return this.exportReport(reportId, format).pipe(
      map((file) => {
        const url = URL.createObjectURL(file.blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = file.fileName;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        window.setTimeout(() => {
          URL.revokeObjectURL(url);
          link.remove();
        }, 0);
        return file;
      })
    );
  }

  private cleanParams(filter: ReportFilter): Record<string, string | number> {
    const params: Record<string, string | number> = {};
    if (filter.startDate) {
      params['startDate'] = filter.startDate;
    }
    if (filter.endDate) {
      params['endDate'] = filter.endDate;
    }
    if (filter.status !== null && filter.status !== undefined) {
      params['status'] = filter.status;
    }
    if (filter.requestType !== null && filter.requestType !== undefined) {
      params['requestType'] = filter.requestType;
    }
    return params;
  }

  private getFileName(contentDisposition: string | null): string | null {
    if (!contentDisposition) {
      return null;
    }

    const match = /filename\*?=(?:UTF-8''|")?([^";]+)/i.exec(contentDisposition);
    return match ? decodeURIComponent(match[1].replace(/"/g, '')) : null;
  }
}
