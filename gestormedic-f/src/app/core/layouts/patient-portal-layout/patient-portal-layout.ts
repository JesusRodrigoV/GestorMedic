import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

interface PortalNavItem {
  label: string;
  icon: string;
  route: string;
  exact?: boolean;
}

@Component({
  selector: 'app-patient-portal-layout',
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './patient-portal-layout.html',
  styleUrl: './patient-portal-layout.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class PatientPortalLayout {
  readonly navItems = signal<PortalNavItem[]>([
    { label: 'Resumen', icon: 'bx-home-heart', route: '/portal/resumen', exact: true },
    { label: 'Citas', icon: 'bx-calendar-event', route: '/portal/citas' },
    { label: 'Historial clinico', icon: 'bx-clipboard', route: '/portal/historial' },
    { label: 'Documentos', icon: 'bx-folder-open', route: '/portal/documentos' },
    { label: 'Recetas', icon: 'bx-capsule', route: '/portal/recetas' },
    { label: 'Facturacion', icon: 'bx-receipt', route: '/portal/facturacion' },
    { label: 'Aseguradoras', icon: 'bx-shield-quarter', route: '/portal/aseguradoras' },
    { label: 'Recordatorios', icon: 'bx-bell', route: '/portal/recordatorios' },
    { label: 'Mi perfil', icon: 'bx-user-circle', route: '/portal/perfil' },
  ]);
}
