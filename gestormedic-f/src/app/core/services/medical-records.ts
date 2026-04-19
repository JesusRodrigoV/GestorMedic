import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import {
  MedicalHistory,
  MedicalHistoryEntry,
  PatientMedicalFile,
} from '@core/models/medical-records.model';
import { environment } from '@env/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class MedicalRecordsService {
  private http = inject(HttpClient);
  private apiUrl = environment.medicalRecordsApiUrl;

  listMyHistories(): Observable<MedicalHistory[]> {
    return this.http.get<MedicalHistory[]>(`${this.apiUrl}/patient/histories`);
  }

  getMyHistory(historyId: string): Observable<{ history: MedicalHistory; entries: MedicalHistoryEntry[] }> {
    return this.http.get<{ history: MedicalHistory; entries: MedicalHistoryEntry[] }>(
      `${this.apiUrl}/patient/histories/${historyId}`,
    );
  }

  patchBasicFields(historyId: string, payload: MedicalHistory['basic_fields']): Observable<MedicalHistory> {
    return this.http.patch<MedicalHistory>(`${this.apiUrl}/patient/histories/${historyId}/basic-fields`, payload);
  }

  listDoctorPatientHistories(patientUserId: number): Observable<MedicalHistory[]> {
    return this.http.get<MedicalHistory[]>(`${this.apiUrl}/doctor/histories/patients/${patientUserId}`);
  }

  listEditableDoctorEntries(): Observable<MedicalHistoryEntry[]> {
    return this.http.get<MedicalHistoryEntry[]>(`${this.apiUrl}/doctor/histories/editable-entries`);
  }

  listDoctorPatientFiles(patientUserId: number): Observable<PatientMedicalFile[]> {
    return this.http.get<PatientMedicalFile[]>(`${this.apiUrl}/doctor/patients/${patientUserId}/files`);
  }

  getDoctorPatientFileContentUrl(patientUserId: number, fileId: string): string {
    return `${this.apiUrl}/doctor/patients/${patientUserId}/files/${fileId}/content`;
  }

  createDoctorEntry(payload: {
    appointment_id: number;
    specialty_id: number;
    specialty_name: string;
    patient_user_id: number;
    section_title: string;
    notes?: string;
    checklist?: Array<Record<string, unknown>>;
    structured_fields?: Record<string, unknown>;
  }): Observable<MedicalHistoryEntry> {
    return this.http.post<MedicalHistoryEntry>(`${this.apiUrl}/doctor/histories/entries`, payload);
  }

  patchDoctorEntry(
    entryId: string,
    payload: {
      section_title?: string;
      notes?: string;
      checklist?: Array<Record<string, unknown>>;
      structured_fields?: Record<string, unknown>;
    },
  ): Observable<MedicalHistoryEntry> {
    return this.http.patch<MedicalHistoryEntry>(`${this.apiUrl}/doctor/histories/entries/${entryId}`, payload);
  }

  uploadMyFile(file: File): Observable<PatientMedicalFile> {
    const formData = new FormData();
    formData.append('uploaded_file', file);
    return this.http.post<PatientMedicalFile>(`${this.apiUrl}/patient/files/upload`, formData);
  }

  listMyFiles(): Observable<PatientMedicalFile[]> {
    return this.http.get<PatientMedicalFile[]>(`${this.apiUrl}/patient/files`);
  }

  deleteMyFile(fileId: string): Observable<{ ok: boolean }> {
    return this.http.delete<{ ok: boolean }>(`${this.apiUrl}/patient/files/${fileId}`);
  }

  getMyFileContentUrl(fileId: string): string {
    return `${this.apiUrl}/patient/files/${fileId}/content`;
  }
}
