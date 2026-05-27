import { Injectable, signal } from '@angular/core';

export type NotificationType = 'success' | 'error' | 'info';

export interface AppNotification {
  type: NotificationType;
  message: string;
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  readonly notification = signal<AppNotification | null>(null);

  show(message: string, type: NotificationType = 'info'): void {
    this.notification.set({ message, type });
    window.setTimeout(() => this.notification.set(null), 4500);
  }
}
