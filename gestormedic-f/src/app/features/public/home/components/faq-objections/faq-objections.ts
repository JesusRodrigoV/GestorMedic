import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { AccordionModule } from 'primeng/accordion';

@Component({
  selector: 'gm-faq-objections',
  imports: [AccordionModule],
  templateUrl: './faq-objections.html',
  styleUrl: './faq-objections.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'gm-faq-host',
  },
})
export class FaqObjections {
  protected readonly faqItems = signal([
    {
      id: 'security',
      question: '¿Bajo qué infraestructura se resguarda la información?',
      answer:
        'Toda la información reside en nodos de alta disponibilidad con redundancia geográfica. Los datos se protegen bajo protocolos de cifrado de grado clínico, garantizando que el profesional mantenga la soberanía absoluta sobre los expedientes de su institución.',
    },
    {
      id: 'transition',
      question: '¿Cuál es el protocolo de migración para registros físicos?',
      answer:
        'GestorMedic facilita una digitalización progresiva. El sistema permite la integración inmediata de documentos escaneados, capturas de resultados y archivos PDF directamente en la ficha del paciente, organizándolos en un ecosistema documental libre de papel.',
    },
    {
      id: 'cost',
      question: '¿La gratuidad del Plan Esencial es permanente?',
      answer:
        'Efectivamente. Nuestro modelo de cooperación busca fortalecer la salud mediante la tecnología. El acceso para médicos independientes no contempla costos de licencia ni mantenimiento en sus funciones nucleares, eliminando cualquier barrera de entrada digital.',
    },
    {
      id: 'support',
      question: '¿Cómo opera el sistema ante contingencias de conectividad?',
      answer:
        'Al ser una arquitectura SaaS, el acceso es ubicuo mediante cualquier dispositivo con red móvil. Complementariamente, nuestro equipo de soporte técnico brinda asistencia en tiempo real para asegurar la continuidad operativa de su consultorio.',
    },
  ]);
}
