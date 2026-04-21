import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { environment } from '@env/environment';

export interface SocialConnection {
  id: number;
  patient_id: number;
  doctor_id: number;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  created_at: string;
}

export interface ChatMessage {
  sender_id: number;
  content: string;
  timestamp: string;
}

@Injectable({ providedIn: 'root' })
export class SocialService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl.replace('/api/v1', '/social/api/v1');
  private wsUrl = environment.apiUrl.replace('http://', 'ws://').replace('/api/v1', '/social/api/v1/chat');
  
  private socket?: WebSocket;
  private messageSubject = new Subject<ChatMessage>();

  // Requests
  sendRequest(doctorId: number, patientId: number): Observable<SocialConnection> {
    return this.http.post<SocialConnection>(`${this.apiUrl}/requests/`, {
      doctor_id: doctorId,
      patient_id: patientId
    });
  }

  getPendingRequests(doctorId: number): Observable<SocialConnection[]> {
    return this.http.get<SocialConnection[]>(`${this.apiUrl}/requests/doctor/${doctorId}`);
  }

  updateRequestStatus(connectionId: number, status: 'ACCEPTED' | 'REJECTED'): Observable<SocialConnection> {
    return this.http.patch<SocialConnection>(`${this.apiUrl}/requests/${connectionId}/`, { status });
  }

  // Chat WebSocket
  connectChat(userId: number): void {
    this.socket = new WebSocket(`${this.wsUrl}/${userId}`);
    this.socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      this.messageSubject.next(data);
    };
  }

  sendMessage(connectionId: number, receiverId: number, content: string): void {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({
        connection_id: connectionId,
        receiver_id: receiverId,
        content: content
      }));
    }
  }

  onMessage(): Observable<ChatMessage> {
    return this.messageSubject.asObservable();
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.close();
    }
  }
}
