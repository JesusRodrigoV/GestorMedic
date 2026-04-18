import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
//import { TenantStore } from '@core/stores/tenant.store';
/*
export const tenantInterceptor: HttpInterceptorFn = (req, next) => {
  const tenantStore = inject(TenantStore);
  const currentClinicId = tenantStore.activeClinicId();

  if (currentClinicId) {
    const clonedRequest = req.clone({
      setHeaders: {
        'X-Tenant-ID': currentClinicId.toString()
      }
    });
    return next(clonedRequest);
  }

  return next(req);
};

*/