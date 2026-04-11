import { ChangeDetectionStrategy, Component, signal } from '@angular/core';

@Component({
  selector: 'gm-specialty-domains',
  imports: [],
  templateUrl: './specialty-domains.html',
  styleUrl: './specialty-domains.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'gm-specialty-host',
  },
})
export class SpecialtyDomains {
  domains = signal([
    {
      id: 'pediatria',
      title: 'Pediatría',
      subtitle: 'Gestión de Tutores',
      microcopy: 'Trazabilidad administrativa integral',
      description:
        'Vinculación automática de fichas clínicas con tutores legales, asegurando la integridad documental del menor.',
      icon: 'bx-id-card',
    },
    {
      id: 'ginecologia',
      title: 'Ginecología',
      subtitle: 'Reserva de Salas',
      microcopy: 'Optimización de recursos diagnósticos',
      description:
        'Gestión inteligente de salas de imagen y equipos especializados vinculados directamente a la cita de la paciente.',
      icon: 'bx-scan',
    },
    {
      id: 'cirugia',
      title: 'Cirugía General',
      subtitle: 'Integración Financiera',
      microcopy: 'Automatización de alta complejidad',
      description:
        'Coordinación de tarifarios con aseguradoras y liquidación automatizada de procedimientos quirúrgicos complejos.',
      icon: 'bx-wallet-alt',
    },
    {
      id: 'consulta',
      title: 'Consulta Externa',
      subtitle: 'Buscador y Agenda',
      microcopy: 'Ecosistema de agendamiento masivo',
      description:
        'Motor de búsqueda público para pacientes con sincronización en tiempo real de la disponibilidad del galeno.',
      icon: 'bx-search-alt',
    },
  ]);
}
