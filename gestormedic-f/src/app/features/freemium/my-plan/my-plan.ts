import { CurrencyPipe, DatePipe, KeyValuePipe, NgClass, TitleCasePipe, UpperCasePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { UserRole } from '@core/models/role.model';
import { FreemiumService } from '@core/services/freemium.service';
import { NotificationService } from '@core/services/notification';
import { AuthStore } from '@features/auth/stores/auth.store';

@Component({
  selector: 'gm-my-plan',
  imports: [CurrencyPipe, DatePipe, KeyValuePipe, NgClass, TitleCasePipe, UpperCasePipe],
  templateUrl: './my-plan.html',
  styleUrl: './my-plan.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class MyPlan {
  private freemium = inject(FreemiumService);
  private notifications = inject(NotificationService);
  private authStore = inject(AuthStore);

  protected roleName = computed(() => {
    const roleId = this.authStore.currentUser()?.role_id;
    if (roleId === UserRole.PACIENTE) return 'paciente';
    if (roleId === UserRole.MEDICO) return 'medico';
    if (roleId === UserRole.ADMIN_CLINICA) return 'admin_clinica';
    return '';
  });

  protected plans = signal<any[]>([]);
  protected subscription = signal<any | null>(null);
  protected entitlements = signal<any | null>(null);
  protected loading = signal(false);

  constructor() {
    this.reloadAll();
  }

  protected reloadAll(): void {
    this.loading.set(true);

    this.freemium.getMySubscription().subscribe({
      next: (sub) => this.subscription.set(sub),
      error: () => this.subscription.set(null),
    });

    this.freemium.getMyEntitlements().subscribe({
      next: (ent) => this.entitlements.set(ent),
      error: () => this.entitlements.set(null),
    });

    this.freemium.getCatalog(this.roleName()).subscribe({
      next: (catalog) => {
        this.plans.set(catalog);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.notifications
          .builder()
          .error()
          .summary('No se pudo cargar el catálogo de planes')
          .detail('Intenta nuevamente en unos segundos.')
          .show();
      },
    });
  }

  protected simulatePayment(planId: number, displayName: string): void {
    const confirmed = window.confirm(`¿Confirmas el pago simulado para activar ${displayName}?`);
    if (!confirmed) return;

    this.freemium.simulateCheckout(planId).subscribe({
      next: (response) => {
        this.notifications
          .builder()
          .success()
          .summary('Suscripción actualizada')
          .detail(`Pago simulado completado. Referencia: ${response.provider_ref}`)
          .show();
        this.reloadAll();
      },
      error: () => {
        this.notifications
          .builder()
          .error()
          .summary('No se pudo procesar el pago simulado')
          .detail('Verifica permisos o disponibilidad del servicio Freemium.')
          .show();
      },
    });
  }

  protected consumeFeature(featureKey: string | number | symbol): void {
    const normalizedFeature = String(featureKey);
    const confirmed = window.confirm(`¿Deseas consumir 1 unidad de ${normalizedFeature}?`);
    if (!confirmed) return;

    this.freemium.consumeFeature(normalizedFeature, 1).subscribe({
      next: (result) => {
        this.notifications
          .builder()
          .info(result.message)
          .summary(result.allowed ? 'Consumo registrado' : 'Límite alcanzado')
          .show();
        this.reloadAll();
      },
      error: () => {
        this.notifications
          .builder()
          .error()
          .summary('No se pudo registrar consumo')
          .detail('Reintenta en unos segundos.')
          .show();
      },
    });
  }
}
