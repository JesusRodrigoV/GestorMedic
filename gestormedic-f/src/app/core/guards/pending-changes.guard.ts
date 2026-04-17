import { CanDeactivateFn } from '@angular/router';

export interface HasPendingChanges {
  hasPendingChanges: () => boolean;
}

export const pendingChangesGuard: CanDeactivateFn<HasPendingChanges> = (component) => {
  if (!component?.hasPendingChanges?.()) {
    return true;
  }

  return window.confirm('Tienes cambios sin guardar en Agenda Semanal. ¿Deseas salir sin guardar?');
};
