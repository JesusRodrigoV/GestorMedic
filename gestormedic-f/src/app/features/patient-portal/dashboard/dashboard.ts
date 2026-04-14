import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-patient-portal-dashboard',
  imports: [RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class PatientPortalDashboard {
  readonly highlights = signal([
    { label: 'Proxima cita', value: '14 Abr - 10:30', detail: 'Cardiologia con Dra. Camila Flores' },
    { label: 'Recetas vigentes', value: '3', detail: '1 vence en 5 dias' },
    { label: 'Estudios pendientes', value: '2', detail: 'Laboratorio y ecografia' },
  ]);

  readonly timeline = signal([
    { date: '09 Abr', title: 'Resultado de laboratorio listo', status: 'Nuevo' },
    { date: '08 Abr', title: 'Recordatorio enviado por WhatsApp', status: 'Enviado' },
    { date: '06 Abr', title: 'Factura de consulta descargada', status: 'Completado' },
  ]);
}
