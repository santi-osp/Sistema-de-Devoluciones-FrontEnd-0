import { Component, input, signal } from '@angular/core';
import { Evidencia, TipoEvidencia } from '../../../models/evidencia.model';
import { formatFileSize } from '../../utils/format-file-size';

@Component({
  selector: 'app-evidence-gallery',
  template: `
    <div class="evidence-gallery">
      @for (item of items(); track item.id) {
        <article class="evidence-card">
          @if (isImage(item) && item.url && !hasImageError(item.id)) {
            <a class="evidence-card__preview evidence-card__preview--image" [href]="item.url" target="_blank" rel="noreferrer" [attr.aria-label]="'Ver evidencia ' + item.fileName">
              <img [src]="item.url" [alt]="item.fileName" loading="lazy" (error)="markImageError(item.id)" />
            </a>
          } @else if (isVideo(item) && item.url) {
            <div class="evidence-card__preview">
              <video [src]="item.url" controls preload="metadata"></video>
            </div>
          } @else {
            <a class="evidence-card__preview evidence-card__preview--file" [href]="item.url ?? item.path" target="_blank" rel="noreferrer">
              <span>{{ fileLabel(item) }}</span>
            </a>
          }

          <div class="evidence-card__body">
            <strong [title]="item.fileName">{{ item.fileName }}</strong>
            <span>{{ evidenceType(item) }} · {{ fileSize(item.sizeInBytes) }}</span>
          </div>
        </article>
      }
    </div>
  `,
  styles: [
    `.evidence-gallery{display:grid;grid-template-columns:repeat(auto-fill,minmax(13rem,1fr));gap:1rem}
     .evidence-card{overflow:hidden;border:1px solid #e2e8f0;border-radius:24px;background:#fff;box-shadow:0 14px 36px rgba(15,23,42,.07)}
     .evidence-card__preview{display:grid;place-items:center;aspect-ratio:4/3;background:#f1f5f9;color:#2563eb;text-decoration:none;overflow:hidden}
     .evidence-card__preview--image{background:#020617}
     .evidence-card__preview--image img{width:100%;height:100%;object-fit:cover;display:block;transition:transform 180ms ease}
     .evidence-card:hover img{transform:scale(1.035)}
     video{width:100%;height:100%;object-fit:cover;background:#020617}
     .evidence-card__preview--file span{display:inline-flex;border-radius:14px;background:#dbeafe;color:#1d4ed8;padding:.75rem 1rem;font-size:.78rem;font-weight:900;text-transform:uppercase;letter-spacing:.08em}
     .evidence-card__body{display:grid;gap:.3rem;padding:1rem}
     .evidence-card__body strong{color:#0f172a;font-weight:900;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
     .evidence-card__body span{color:#64748b;font-size:.82rem;font-weight:800}`
  ]
})
export class EvidenceGallery {
  readonly items = input<readonly Evidencia[]>([]);
  readonly fileSize = formatFileSize;
  private readonly brokenImages = signal<ReadonlySet<string>>(new Set<string>());

  isImage(item: Evidencia): boolean {
    return Number(item.type) === TipoEvidencia.Imagen || /\.(jpe?g|png|webp|gif|heic|heif)$/i.test(item.fileName);
  }

  isVideo(item: Evidencia): boolean {
    return Number(item.type) === TipoEvidencia.Video || /\.(mp4|mov|webm)$/i.test(item.fileName);
  }

  hasImageError(id: string): boolean {
    return this.brokenImages().has(id);
  }

  markImageError(id: string): void {
    this.brokenImages.update((current) => new Set([...current, id]));
  }

  evidenceType(item: Evidencia): string {
    switch (Number(item.type)) {
      case TipoEvidencia.Imagen:
        return 'Imagen';
      case TipoEvidencia.Video:
        return 'Video';
      case TipoEvidencia.Pdf:
        return 'PDF';
      case TipoEvidencia.Comprobante:
        return 'Comprobante';
      default:
        return 'Archivo';
    }
  }

  fileLabel(item: Evidencia): string {
    if (Number(item.type) === TipoEvidencia.Pdf || /\.pdf$/i.test(item.fileName)) {
      return 'PDF';
    }

    return 'Archivo';
  }
}
