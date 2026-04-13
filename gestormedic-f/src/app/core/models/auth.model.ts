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
  specialty: string;
  license: string;
  phone: string;
  bio: string;
  clinic_name: string;
  address: string;
  instagram: string;
  twitter: string;
  facebook: string;
  working_days: string[];
  working_hours: string;
  notification_new_appointment: boolean;
  notification_appointment_reminder: boolean;
  notification_appointment_cancellation: boolean;
  notification_whatsapp_alerts: boolean;
  notification_email_alerts: boolean;
  notification_marketing_emails: boolean;
  notification_login_alerts: boolean;
  notification_password_changes: boolean;
  appearance_theme: ThemePreference;
  appearance_accent_color: AccentPreference;
  appearance_density: DensityPreference;
  created_at: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
}

export type ThemePreference = 'light' | 'dark';
export type AccentPreference = 'energy' | 'emerald' | 'violet' | 'rose';
export type DensityPreference = 'standard' | 'compact';

export interface UpdateProfilePayload {
  first_name: string;
  last_name: string;
  username: string;
  specialty: string;
  license: string;
  phone: string;
  bio: string;
  clinic_name: string;
  address: string;
  instagram: string;
  twitter: string;
  facebook: string;
  working_days: string[];
  working_hours: string;
  photo_url: string;
}

export interface NotificationSettingsPayload {
  newAppointment: boolean;
  appointmentReminder: boolean;
  appointmentCancellation: boolean;
  whatsappAlerts: boolean;
  emailAlerts: boolean;
  marketingEmails: boolean;
  loginAlerts: boolean;
  passwordChanges: boolean;
}

export interface AppearanceSettingsPayload {
  theme: ThemePreference;
  accent_color: AccentPreference;
  density: DensityPreference;
}

export interface AuthState {
  user: User | null;
  status: 'loading' | 'authenticated' | 'unauthenticated' | 'error';
  error: string | null;
}
