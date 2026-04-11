export type NotificationType = 'info' | 'warning' | 'success' | 'critical';

export interface AppNotification {
  id: string;
  title: string;
  description: string;
  timestamp: Date;
  type: NotificationType;
  isRead: boolean;
}
