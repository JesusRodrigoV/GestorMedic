export interface MedicalHistory {
  id: string;
  patient_user_id: number;
  history_key: string;
  specialty_id?: number | null;
  specialty_name: string;
  doctor_profile_id?: number | null;
  doctor_name?: string | null;
  basic_fields: {
    blood_type?: string | null;
    allergies?: string[];
    chronic_conditions?: string[];
    current_medications?: string[];
    emergency_contact_name?: string | null;
    emergency_contact_phone?: string | null;
    notes?: string | null;
    [key: string]: unknown;
  };
  created_at: string;
  updated_at: string;
}

export interface MedicalHistoryEntry {
  id: string;
  history_id: string;
  appointment_id: number;
  patient_user_id: number;
  doctor_profile_id: number;
  specialty_id: number;
  specialty_name: string;
  section_title: string;
  notes?: string | null;
  checklist: Array<Record<string, unknown>>;
  structured_fields: Record<string, unknown>;
  created_at: string;
  editable_until: string;
}

export interface PatientMedicalFile {
  id: string;
  patient_user_id: number;
  original_name: string;
  content_type: string;
  extension: string;
  size_bytes: number;
  uploaded_at: string;
  appwrite_file_id: string;
  appwrite_bucket_id: string;
}
