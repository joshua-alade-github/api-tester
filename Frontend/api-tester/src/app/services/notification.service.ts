import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export type NotificationType = 'success' | 'error' | 'info' | 'warning';

export interface Notification {
  type: NotificationType;
  message: string;
  timeout?: number;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private _notifications = new Subject<Notification>();
  
  notifications$ = this._notifications.asObservable();

  constructor() { }

  success(message: string, timeout = 5000): void {
    this._notifications.next({ type: 'success', message, timeout });
  }

  error(message: string, timeout = 5000): void {
    this._notifications.next({ type: 'error', message, timeout });
  }

  info(message: string, timeout = 5000): void {
    this._notifications.next({ type: 'info', message, timeout });
  }

  warning(message: string, timeout = 5000): void {
    this._notifications.next({ type: 'warning', message, timeout });
  }
}