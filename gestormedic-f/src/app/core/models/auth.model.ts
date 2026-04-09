export interface User {
  id: number;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  is_active: boolean;
  is_admin: boolean;
  role_id: number;
  clinic_id: number;
  photo_url: string;
  created_at: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
}

export interface AuthState {
  user: User | null;
  status: 'loading' | 'authenticated' | 'unauthenticated' | 'error';
  error: string | null;
}
