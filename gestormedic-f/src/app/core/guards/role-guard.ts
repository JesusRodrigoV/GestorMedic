import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthStore } from '@features/auth/stores/auth.store';
import { UserRole } from '@core/models/role.model';

export const roleGuard: CanActivateFn = (route, state) => {
  const authStore = inject(AuthStore);
  const router = inject(Router);

  const user = authStore.currentUser();
  const allowedRoles = route.data['allowedRoles'] as UserRole[];

  if (!allowedRoles || allowedRoles.length === 0) {
    return true;
  }

  if (user && allowedRoles.includes(user.role_id)) {
    return true;
  }

  return router.createUrlTree(['/auth/login']);
};
