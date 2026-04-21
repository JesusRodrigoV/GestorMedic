import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SocialService, SocialConnection } from '@core/services/social.service';
import { AuthStore } from '@features/auth/stores/auth.store';
import { NotificationService } from '@core/services/notification';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { HttpClient } from '@angular/common/http';
import { environment } from '@env/environment';

@Component({
  selector: 'gm-social-inbox',
  standalone: true,
  imports: [CommonModule, DialogModule, ButtonModule],
  templateUrl: './social-inbox.html',
  styleUrl: './social-inbox.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class SocialInbox {
  private socialService = inject(SocialService);
  protected authStore = inject(AuthStore);
  private notification = inject(NotificationService);
  private http = inject(HttpClient);

  readonly requests = signal<SocialConnection[]>([]);
  readonly selectedPatientHistory = signal<any | null>(null);
  readonly showHistoryModal = signal(false);
  readonly loadingHistory = signal(false);

  constructor() {
    this.loadRequests();
  }

  loadRequests(): void {
    const user = this.authStore.currentUser();
    if (user) {
      this.socialService.getPendingRequests(user.id).subscribe({
        next: (data) => this.requests.set(data),
      });
    }
  }

  viewHistory(patientId: number): void {
    this.loadingHistory.set(true);
    this.showHistoryModal.set(true);
    
    // Consultar el historial médico del paciente vía Gateway -> Historiales
    const historialesUrl = environment.apiUrl.replace('/api/v1', '/historiales/api/v1');
    this.http.get(`${historialesUrl}/patient/${patientId}/history`, { withCredentials: true }).subscribe({
      next: (history) => {
        this.selectedPatientHistory.set(history);
        this.loadingHistory.set(false);
      },
      error: () => {
        this.notification.builder().warn().summary('Error').detail('No se pudo cargar el historial del paciente.').show();
        this.showHistoryModal.set(false);
        this.loadingHistory.set(false);
      }
    });
  }

  respondRequest(connectionId: number, status: 'ACCEPTED' | 'REJECTED'): void {
    this.socialService.updateRequestStatus(connectionId, status).subscribe({
      next: () => {
        this.notification.builder().success().summary('Éxito').detail(`Solicitud ${status === 'ACCEPTED' ? 'aceptada' : 'rechazada'}.`).show();
        this.loadRequests();
        this.showHistoryModal.set(false);
      }
    });
  }
}
