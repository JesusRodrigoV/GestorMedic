export type NotificationSeverity = 'success' | 'info' | 'warn' | 'error' | 'secondary' | 'contrast';

export interface NotificationState {
  severity: NotificationSeverity;
  summary: string;
  detail: string;
  life: number;
  sticky: boolean;
  key?: string;
  position?: string;
}
