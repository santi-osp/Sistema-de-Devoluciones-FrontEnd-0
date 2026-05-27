import { Component, output } from '@angular/core';

@Component({
  selector: 'app-file-uploader',
  template: `
    <label class="uploader">
      <span>Seleccionar archivo</span>
      <input type="file" (change)="onFileSelected($event)" />
    </label>
  `,
  styles: [
    `.uploader{display:grid;place-items:center;min-height:10rem;border:2px dashed #93c5fd;border-radius:24px;background:#eff6ff;color:#1d4ed8;font-weight:900;cursor:pointer;transition:border-color 150ms ease,background 150ms ease}
     .uploader:hover{border-color:#2563eb;background:#dbeafe}
     input{display:none}`
  ]
})
export class FileUploader {
  readonly fileSelected = output<File>();

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.item(0);
    if (file) {
      this.fileSelected.emit(file);
    }
  }
}
