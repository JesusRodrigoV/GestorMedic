export interface AuditUser {
  id: number;
  username: string;
  email: string;
}

export interface AuditLog {
  id: number;
  event: string;
  timestamp: string;
  attempted_email?: string;
  ip_address?: string;
  user_agent?: string;
  details?: Record<string, any>;
  clinic_id?: number;
  user?: AuditUser;
}

export interface PaginatedAuditLogs {
  items: AuditLog[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

export interface AuditQueryParams {
  clinic_id?: number | null;
  event_type?: string | null;
  page?: number;
  size?: number;
}