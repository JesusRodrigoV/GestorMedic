import { inject } from '@angular/core';
import { CanActivateChildFn, Router } from '@angular/router';
import { AuthStore } from '@features/auth/stores/auth.store';
import { UserRole } from '@core/models/role.model';

export const authGuard: CanActivateChildFn = (childRoute, state) => {
  const authStore = inject(AuthStore);
  const router = inject(Router);

  if (authStore.isAuthenticated()) {
    const user = authStore.currentUser();
    let route = '/';

    if (user) {
      if (user.is_admin || user.role_id === UserRole.SUPERADMIN) {
        route = '/control/management';
      } else if (user.role_id === UserRole.ADMIN_CLINICA || user.role_id === UserRole.MEDICO) {
        route = '/app/dashboard';
      } else {
        route = '/portal/appointments';
      }
    }

    return router.createUrlTree([route]);
  }

  return true;
};
