import { ChangeDetectionStrategy, Component, signal } from '@angular/core';

@Component({
  selector: 'gm-videocall-steps',
  imports: [],
  templateUrl: './videocall-steps.html',
  styleUrl: './videocall-steps.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'gm-videocall-steps-host' },
})
export class VideocallSteps {
  steps = signal([
    { id: 'prep', title: 'Preparación', detail: 'Verifica cámara, audio y carga estudios.' },
    { id: 'ident', title: 'Identificación', detail: 'Confirma identidad y firma digital.' },
    { id: 'consulta', title: 'Consulta', detail: 'Sesión médica con notas estructuradas.' },
    { id: 'post', title: 'Cierre', detail: 'Receta digital, resumen y agenda de seguimiento.' },
  ]);
}
