export interface PatientProfile {
  id: number;
  user_id: number;
  ci_number?: string;
  date_of_birth?: string;
  gender?: string;
  blood_type?: string;
  allergies?: string;
  occupation?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
}

export type UpdatePatientProfileData = Partial<Omit<PatientProfile, 'id' | 'user_id'>>;
