export type NotificationType = 'info' | 'warning' | 'success' | 'critical';

export interface AppNotificationDto {
  id: number;
  title: string;
  description: string;
  type: NotificationType;
  is_read: boolean;
  created_at: string;
}

export interface AppointmentDto {
  id: number;
  patient_name: string;
  patient_email: string;
  doctor_name: string;
  appointment_datetime: string;
  location: string;
  reason: string;
  status: 'Programada' | 'Confirmada' | 'Completada' | 'Cancelada';
  created_at: string;
}

export interface CreateAppointmentPayload {
  patient_name: string;
  patient_email: string;
  appointment_datetime: string;
  location: string;
  reason: string;
  status: 'Programada' | 'Confirmada' | 'Completada' | 'Cancelada';
}

export interface MedicalRecordDto {
  id: number;
  patient_name: string;
  patient_email: string;
  doctor_name: string;
  diagnosis: string;
  treatment: string;
  notes: string;
  status: 'Seguimiento' | 'Finalizado' | 'En tratamiento';
  created_at: string;
}

export interface CreateMedicalRecordPayload {
  patient_name: string;
  patient_email: string;
  diagnosis: string;
  treatment: string;
  notes: string;
  status: 'Seguimiento' | 'Finalizado' | 'En tratamiento';
}

export interface PrescriptionDto {
  id: number;
  patient_name: string;
  patient_email: string;
  doctor_name: string;
  medication: string;
  indications: string;
  status: 'Activa' | 'Completada' | 'Cancelada';
  issued_at: string;
}

export interface CreatePrescriptionPayload {
  patient_name: string;
  patient_email: string;
  medication: string;
  indications: string;
  medical_record_id?: number;
  status: 'Activa' | 'Completada' | 'Cancelada';
}

export interface DoctorDto {
  id: number;
  name: string;
  specialty: string;
}

export interface AvailabilitySlotDto {
  id: number;
  doctor_id: number;
  doctor_name: string;
  slot_start: string;
  slot_end: string;
  is_available: boolean;
}

export interface DoctorAvailabilityPayload {
  date: string;
  hours: string[];
  slot_duration_minutes: number;
}

export interface AppointmentBookingPayload {
  slot_id: number;
  reason: string;
}
