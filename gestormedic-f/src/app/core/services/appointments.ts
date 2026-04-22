import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import {
  AppointmentItem,
  DoctorCard,
  RoomPermissionPayload,
  SlotsByDay,
  SpecialtyPermissionPayload,
  WeeklyBlock,
} from '@core/models/appointment.model';
import { environment } from '@env/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AppointmentsService {
  private http = inject(HttpClient);
  private apiUrl = environment.appointmentsApiUrl;

  private readonly httpOptions = {
    withCredentials: true,
  };

  listDoctors(params: {
    q?: string;
    specialty_id?: number;
    clinic_id?: number;
    page?: number;
    page_size?: number;
  }): Observable<{ items: DoctorCard[]; meta: { total: number; page: number; pageSize: number } }> {
    return this.http.get<{ items: DoctorCard[]; meta: { total: number; page: number; pageSize: number } }>(
      `${this.apiUrl}/public/doctors`,
      { params: params as Record<string, string | number>, ...this.httpOptions },
    );
  }

  getDoctorAvailability(
    doctorId: number,
    dateFrom: string,
    dateTo: string,
  ): Observable<SlotsByDay[]> {
    return this.http.get<SlotsByDay[]>(`${this.apiUrl}/public/doctors/${doctorId}/availability`, {
      params: { date_from: dateFrom, date_to: dateTo },
      ...this.httpOptions,
    });
  }

  reserveAppointment(payload: { doctor_id: number; starts_at: string; extra_notes?: string }): Observable<AppointmentItem> {
    return this.http.post<AppointmentItem>(`${this.apiUrl}/patient/appointments/reserve`, payload, this.httpOptions);
  }

  getMyAppointments(status?: string): Observable<AppointmentItem[]> {
    return this.http.get<AppointmentItem[]>(`${this.apiUrl}/patient/appointments/my`, {
      params: status ? { status } : {},
      ...this.httpOptions,
    });
  }

  getWeeklyAgenda(): Observable<WeeklyBlock[]> {
    return this.http.get<WeeklyBlock[]>(`${this.apiUrl}/doctor/agenda/weekly`, this.httpOptions);
  }

  saveWeeklyAgenda(payload: WeeklyBlock[]): Observable<WeeklyBlock[]> {
    return this.http.put<WeeklyBlock[]>(`${this.apiUrl}/doctor/agenda/weekly`, payload, this.httpOptions);
  }

  getDoctorCalendar(dateFrom: string, dateTo: string): Observable<SlotsByDay[]> {
    return this.http.get<SlotsByDay[]>(`${this.apiUrl}/doctor/agenda/calendar`, {
      params: { date_from: dateFrom, date_to: dateTo },
      ...this.httpOptions,
    });
  }

  patchDoctorSlot(
    slotStartIso: string,
    payload: {
      slot_end: string;
      specialty_id: number;
      room_id: number;
      consultation_price?: number;
      extra_description?: string;
      is_blocked?: boolean;
    },
  ): Observable<{ ok: boolean }> {
    return this.http.patch<{ ok: boolean }>(`${this.apiUrl}/doctor/agenda/slots/${slotStartIso}`, payload, this.httpOptions);
  }

  getDoctorAppointmentsByDay(day: string): Observable<AppointmentItem[]> {
    return this.http.get<AppointmentItem[]>(`${this.apiUrl}/doctor/appointments/day`, {
      params: { day },
      ...this.httpOptions,
    });
  }

  postDoctorReport(appointmentId: number, payload: { report_text: string; diagnosis?: string; prescription?: string; follow_up?: string }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/doctor/appointments/${appointmentId}/report`, payload, this.httpOptions);
  }

  getMyAppointmentReport(appointmentId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/patient/appointments/${appointmentId}/report`, this.httpOptions);
  }

  postAppointmentRating(appointmentId: number, payload: { rating: number; doctor_id: number; patient_id: number; comment?: string }): Observable<any> {
    const rankingUrl = this.apiUrl.replace('/citas/api/v1', '/ranking/api/v1');
    // Aseguramos que la URL termine en / para pegarle al POST root del microservicio de ranking
    return this.http.post<any>(`${rankingUrl}/`, {
      appointment_id: appointmentId,
      doctor_id: payload.doctor_id,
      patient_id: payload.patient_id,
      score: payload.rating, // microservice uses 'score'
      comment: payload.comment
    }, this.httpOptions);
  }

  listClinicRooms(): Observable<{ id: number; name: string; is_active: boolean }[]> {
    return this.http.get<{ id: number; name: string; is_active: boolean }[]>(`${this.apiUrl}/admin/rooms`, this.httpOptions);
  }

  listClinicDoctors(): Observable<{ doctor_id: number; name: string; email: string }[]> {
    return this.http.get<{ doctor_id: number; name: string; email: string }[]>(`${this.apiUrl}/admin/doctors`, this.httpOptions);
  }

  listAdminSpecialties(): Observable<{ id: number; name: string }[]> {
    return this.http.get<{ id: number; name: string }[]>(`${this.apiUrl}/admin/specialties`, this.httpOptions);
  }

  listPublicSpecialties(): Observable<{ id: number; name: string }[]> {
    return this.http.get<{ id: number; name: string }[]>(`${environment.apiUrl}/specialties`, this.httpOptions);
  }

  listSpecialties(): Observable<{ id: number; name: string }[]> {
    return this.listAdminSpecialties();
  }

  addDoctorRoomPermission(roomId: number, payload: RoomPermissionPayload): Observable<{ ok: boolean }> {
    return this.http.post<{ ok: boolean }>(`${this.apiUrl}/admin/rooms/${roomId}/permissions/doctor`, payload, this.httpOptions);
  }

  addSpecialtyRoomPermission(roomId: number, payload: SpecialtyPermissionPayload): Observable<{ ok: boolean }> {
    return this.http.post<{ ok: boolean }>(`${this.apiUrl}/admin/rooms/${roomId}/permissions/specialty`, payload, this.httpOptions);
  }

  getRoomPermissions(roomId: number): Observable<{
    room_id: number;
    doctor_permissions: Array<{
      id: number;
      doctor_id: number;
      weekday: number;
      start_time: string;
      end_time: string;
      is_active: boolean;
    }>;
    specialty_permissions: Array<{ id: number; specialty_id: number; is_active: boolean }>;
  }> {
    return this.http.get<{
      room_id: number;
      doctor_permissions: Array<{
        id: number;
        doctor_id: number;
        weekday: number;
        start_time: string;
        end_time: string;
        is_active: boolean;
      }>;
      specialty_permissions: Array<{ id: number; specialty_id: number; is_active: boolean }>;
    }>(`${this.apiUrl}/admin/rooms/${roomId}/permissions`, this.httpOptions);
  }
}
