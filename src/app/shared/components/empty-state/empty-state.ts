import { Component, input } from '@angular/core';

@Component({
  selector: 'app-empty-state',
  template: `
    <section class="empty-state">
      <div class="empty-state__mark">—</div>
      <h3>{{ title() }}</h3>
      <p>{{ description() }}</p>
    </section>
  `,
  styles: [
    `.empty-state{border:1px dashed #cbd5e1;border-radius:8px;padding:2rem;text-align:center;background:#f8fafc}
     .empty-state__mark{margin:0 auto 1rem;width:2.5rem;height:2.5rem;border-radius:8px;background:#e0f2fe;color:#0369a1;display:grid;place-items:center;font-weight:900}
     h3{margin:0;color:#0f172a;font-size:1rem}p{margin:.35rem auto 0;color:#64748b;max-width:32rem}`
  ]
})
export class EmptyState {
  readonly title = input('Sin resultados');
  readonly description = input('No hay informacion disponible para esta vista.');
}
