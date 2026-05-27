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
    `.empty-state{border:1px dashed #cbd5e1;border-radius:24px;padding:2.5rem;text-align:center;background:#fff;box-shadow:0 10px 28px rgba(15,23,42,.04)}
     .empty-state__mark{margin:0 auto 1rem;width:3.25rem;height:3.25rem;border-radius:18px;background:#e0f2fe;color:#0369a1;display:grid;place-items:center;font-weight:900}
     h3{margin:0;color:#0f172a;font-size:1.1rem;font-weight:900}p{margin:.45rem auto 0;color:#64748b;max-width:32rem;font-weight:700;line-height:1.5}`
  ]
})
export class EmptyState {
  readonly title = input('Sin resultados');
  readonly description = input('No hay informacion disponible para esta vista.');
}
