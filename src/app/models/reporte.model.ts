import { ExportedFile } from './exported-file.model';
import { Metric } from './metric.model';

export interface Reporte {
  id: string;
  name?: string;
  title?: string;
  generatedAt?: string;
  generatedByUserId?: string;
  metrics?: Metric[];
  exportedFiles?: ExportedFile[];
}
