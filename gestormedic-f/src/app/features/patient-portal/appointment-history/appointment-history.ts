import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-appointment-history',
  imports: [RouterLink],
  templateUrl: './appointment-history.html',
  styleUrl: './appointment-history.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class AppointmentHistory {
  readonly nextAppointments = signal([
    {
      date: '14 Abr 2026 - 10:30',
      doctor: 'Dra. Camila Flores',
      type: 'Cardiologia',
      mode: 'Videollamada',
      status: 'Confirmada',
    },
    {
      date: '20 Abr 2026 - 17:00',
      doctor: 'Dr. Daniel Perez',
      type: 'Medicina interna',
      mode: 'Presencial',
      status: 'Pendiente de pago',
    },
  ]);

  readonly records = signal([
    'Resumen clinico de ultima consulta',
    'Resultado de laboratorio - perfil lipidico',
    'Indicaciones de seguimiento en casa',
  ]);

  readonly actionCards = signal([
    {
      title: 'Renovar receta',
      detail: 'Solicita renovacion en menos de 2 minutos.',
    },
    {
      title: 'Subir estudios',
      detail: 'Adjunta imagenes o PDF para tu proxima cita.',
    },
    {
      title: 'Configurar recordatorios',
      detail: 'Activa alertas para medicacion y controles.',
    },
  ]);
}
