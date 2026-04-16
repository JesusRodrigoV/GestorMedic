export interface PatientProfile {
  ci_number: string;
  date_of_birth: string;
  gender: string;
  blood_type: string;
  allergies: string;
  occupation: string;
  emergency_contact_name: string;
  emergency_contact_phone: string;
  id: number;
  user_id: number;
}

export type UpdatePatientProfilePayload = Omit<PatientProfile, 'id' | 'user_id'>;
