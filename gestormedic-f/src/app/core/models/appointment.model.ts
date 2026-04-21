export interface DoctorCard {
  doctor_id: number;
  user_id: number;
  doctor_name: string;
  email: string;
  bio?: string | null;
  experience_years: number;
  specialties: string[];
}

export interface SlotItem {
  doctor_id: number;
  starts_at: string;
  ends_at: string;
  specialty_id: number;
  specialty_name: string;
  room_id: number;
  room_name: string;
  consultation_price?: number | null;
  is_available: boolean;
}

export interface SlotsByDay {
  day: string;
  slots: SlotItem[];
}

export interface WeeklyBlock {
  id?: number;
  weekday: number;
  start_time: string;
  end_time: string;
  consultation_minutes: number;
  specialty_id: number;
  room_id: number;
  consultation_price?: number | null;
}

export interface AppointmentItem {
  id: number;
  doctor_id: number;
  doctor_name: string;
  patient_user_id: number;
  patient_name: string;
  specialty_name: string;
  room_name: string;
  starts_at: string;
  ends_at: string;
  status: string;
  extra_notes?: string | null;
  rating?: number | null;
}

export interface RoomPermissionPayload {
  doctor_id: number;
  weekday: number;
  start_time: string;
  end_time: string;
}

export interface SpecialtyPermissionPayload {
  specialty_id: number;
}
