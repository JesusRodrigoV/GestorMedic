import { Specialty } from "./specialty.model";

export interface DoctorProfile {
  id: number;
  user_id: number;
  license_number: string;
  bio: string;
  experience_years: number;
  signature_url: string;
  base_consultation_price: number;
  is_telemedicine_enabled: boolean;
  clinics: number[];
  specialties: Specialty[];
}

export interface UpdateDoctorProfilePayload {
  license_number: string;
  bio: string;
  experience_years: number;
  signature_url: string;
  base_consultation_price: number;
  is_telemedicine_enabled: boolean;
  specialty_ids: number[];
}
