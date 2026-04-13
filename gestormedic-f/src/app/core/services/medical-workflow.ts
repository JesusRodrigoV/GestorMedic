import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@env/environment';
import { Observable } from 'rxjs';
import {
  AppNotificationDto,
  AppointmentDto,
  CreateAppointmentPayload,
  AppointmentBookingPayload,
  AvailabilitySlotDto,
  DoctorAvailabilityPayload,
  DoctorDto,
  CreateMedicalRecordPayload,
  CreatePrescriptionPayload,
  MedicalRecordDto,
  PrescriptionDto,
} from '@core/models/medical-workflow.model';

@Injectable({
  providedIn: 'root',
})
export class MedicalWorkflow {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  getNotifications(): Observable<AppNotificationDto[]> {
    return this.http.get<AppNotificationDto[]>(`${this.apiUrl}/notifications`);
  }

  markNotificationAsRead(notificationId: number): Observable<AppNotificationDto> {
    return this.http.put<AppNotificationDto>(`${this.apiUrl}/notifications/${notificationId}/read`, {});
  }

  markAllNotificationsAsRead(): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(`${this.apiUrl}/notifications/read-all`, {});
  }

  getAppointments(): Observable<AppointmentDto[]> {
    return this.http.get<AppointmentDto[]>(`${this.apiUrl}/appointments`);
  }

  createAppointment(payload: CreateAppointmentPayload): Observable<AppointmentDto> {
    return this.http.post<AppointmentDto>(`${this.apiUrl}/appointments`, payload);
  }

  updateAppointmentStatus(
    appointmentId: number,
    status: AppointmentDto['status'],
  ): Observable<AppointmentDto> {
    return this.http.put<AppointmentDto>(`${this.apiUrl}/appointments/${appointmentId}/status`, { status });
  }

  getMedicalRecords(): Observable<MedicalRecordDto[]> {
    return this.http.get<MedicalRecordDto[]>(`${this.apiUrl}/medical-records`);
  }

  createMedicalRecord(payload: CreateMedicalRecordPayload): Observable<MedicalRecordDto> {
    return this.http.post<MedicalRecordDto>(`${this.apiUrl}/medical-records`, payload);
  }

  getPrescriptions(): Observable<PrescriptionDto[]> {
    return this.http.get<PrescriptionDto[]>(`${this.apiUrl}/prescriptions`);
  }

  createPrescription(payload: CreatePrescriptionPayload): Observable<PrescriptionDto> {
    return this.http.post<PrescriptionDto>(`${this.apiUrl}/prescriptions`, payload);
  }

  getDoctors(): Observable<DoctorDto[]> {
    return this.http.get<DoctorDto[]>(`${this.apiUrl}/doctors`);
  }

  getDoctorAvailability(doctorId: number, date?: string): Observable<AvailabilitySlotDto[]> {
    const params = date ? `?date=${encodeURIComponent(date)}` : '';
    return this.http.get<AvailabilitySlotDto[]>(`${this.apiUrl}/doctors/${doctorId}/availability${params}`);
  }

  createDoctorAvailability(payload: DoctorAvailabilityPayload): Observable<AvailabilitySlotDto[]> {
    return this.http.post<AvailabilitySlotDto[]>(`${this.apiUrl}/doctors/availability`, payload);
  }

  bookAppointment(payload: AppointmentBookingPayload): Observable<AppointmentDto> {
    return this.http.post<AppointmentDto>(`${this.apiUrl}/appointments/book`, payload);
  }
}
