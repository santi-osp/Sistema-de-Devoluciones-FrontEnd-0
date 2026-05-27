export enum TipoEvidencia {
  Imagen = 1,
  Video = 2,
  Pdf = 3,
  Comprobante = 4,
  Otro = 99
}

export interface Evidencia {
  id: string;
  requestId: string;
  type: TipoEvidencia;
  bucket: string;
  path: string;
  url?: string | null;
  fileName: string;
  sizeInBytes: number;
  uploadedAt: string;
}
