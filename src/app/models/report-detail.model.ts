import { ExportedFile } from './exported-file.model';
import { Metric } from './metric.model';
import { ReportFilter } from './report-filter.model';

export interface ReportSummary {
  id: string;
  title: string;
  generatedBy: string;
  generatedAt: string;
  metricCount: number;
}

export interface ReportDetail {
  id: string;
  title: string;
  filter: ReportFilter;
  generatedBy: string;
  generatedAt: string;
  metrics: Metric[];
  exportedFiles: ExportedFile[];
}
