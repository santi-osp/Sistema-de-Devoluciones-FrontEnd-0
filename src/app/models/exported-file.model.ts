export enum FormatoReporte {
  Csv = 1,
  Pdf = 2
}

export interface ExportedFile {
  id: string;
  reportId: string;
  format: FormatoReporte;
  bucket: string;
  path: string;
  url?: string | null;
  fileName: string;
  exportedAt: string;
}

export interface DownloadedReportFile {
  blob: Blob;
  fileName: string;
  contentType: string;
}
