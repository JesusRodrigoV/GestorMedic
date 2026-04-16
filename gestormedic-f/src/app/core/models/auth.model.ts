import { UserRole } from './role.model';

export interface User {
  id: number;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  full_name?: string;
  is_active: boolean;
  is_admin: boolean;
  role_id: UserRole;
  clinic_id?: number;
  photo_url?: string;
  created_at: string;
  is_totp_enabled: boolean;
  locked_until?: string;
  status?: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token?: string;
  token_type: string;
  session_token?: string;
}

export interface AuthState {
  user: User | null;
  status: 'loading' | 'authenticated' | 'unauthenticated' | 'error' | 'awaiting_2fa'; 
  error: string | null;
  sessions: UserSession[];
  pendingSessionToken: string | null; 
}

export interface UserSession {
  jti: string;
  device_info: string;
  created_at: string;
  expires_at: string;
  is_current: boolean;
}

export interface TwoFAInfo {
  secret: string;
  qr_code_uri: string;
  backup_codes: string[];
}

export interface ResetPasswordData {
  token: string;
  new_password?: string;
}

export interface LoginCredentials {
  email?: string;
  username?: string;
  password?: string;
}

export interface RegisterData {
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  password: string;
  google_id?: string;
}

export interface ForgotPasswordData {
  email: string;
}

export interface GoogleLoginData {
  credential: string;
}