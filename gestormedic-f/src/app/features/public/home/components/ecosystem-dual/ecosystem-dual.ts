import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RoundedButton } from '@shared/ui/rounded-button';
import { RouterLink } from "@angular/router";

@Component({
  selector: 'gm-ecosystem-dual',
  imports: [RoundedButton, RouterLink],
  templateUrl: './ecosystem-dual.html',
  styleUrl: './ecosystem-dual.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'gm-ecosystem-host',
  },
})
export class EcosystemDual {
  protected readonly doctorFeatures = signal([
    {
      icon: 'bx-shield-quarter',
      title: 'Control Total',
      desc: 'Gestión de expedientes bajo cifrado clínico inalterable.',
    },
    {
      icon: 'bx-stats',
      title: 'Solidez Financiera',
      desc: 'Liquidaciones con aseguradoras y facturación inmediata.',
    },
    {
      icon: 'bx-buildings',
      title: 'Jurisdicción Multi-Clínica',
      desc: 'Opere en múltiples centros desde una sola cuenta maestra.',
    },
  ]);

  protected readonly patientFeatures = signal([
    {
      icon: 'bx-search-alt',
      title: 'Libertad de Elección',
      desc: 'Buscador con comparativas de precios y especialidad médica.',
    },
    {
      icon: 'bx-folder-open',
      title: 'Transparencia Total',
      desc: 'Acceso inmediato a resultados, análisis y facturas personales.',
    },
    {
      icon: 'bxl-whatsapp',
      title: 'Ubicuidad Digital',
      desc: 'Recordatorios automáticos por WhatsApp y canales modernos.',
    },
  ]);
}
