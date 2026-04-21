import { computed, inject } from '@angular/core';
import { pipe, switchMap, tap } from 'rxjs';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { tapResponse } from '@ngrx/operators';
import { AuditService } from '@core/services/audit-service';
import { NotificationService } from '@core/services/notification';
import { AuditLog, AuditQueryParams } from '@core/models/audit.model';

type AuditState = {
  items: AuditLog[];
  total: number;
  page: number;
  size: number;
  clinicIdFilter: number | null;
  eventTypeFilter: string | null;
  isLoading: boolean;
  error: string | null;
};

const initialState: AuditState = {
  items: [],
  total: 0,
  page: 1,
  size: 10,
  clinicIdFilter: null,
  eventTypeFilter: null,
  isLoading: false,
  error: null,
};

export const AuditStore = signalStore(
  withState(initialState),
  withComputed(({ items, total, isLoading, page, size, clinicIdFilter, eventTypeFilter }) => ({
    logsList: computed(() => items()),
    totalRecords: computed(() => total()),
    isProcessing: computed(() => isLoading()),
    currentPage: computed(() => page()),
    pageSize: computed(() => size()),
    currentClinicFilter: computed(() => clinicIdFilter()),
    currentEventFilter: computed(() => eventTypeFilter()),
  })),
  withMethods(
    (store, auditService = inject(AuditService), notification = inject(NotificationService)) => ({
      loadLogs: rxMethod<AuditQueryParams>(
        pipe(
          tap(() => patchState(store, { isLoading: true, error: null })),
          switchMap((filters) =>
            auditService.getLogs(filters).pipe(
              tapResponse({
                next: (res) => {
                  patchState(store, {
                    items: res.items,
                    total: res.total,
                    page: filters.page || 1,
                    size: filters.size || 10,
                    clinicIdFilter: filters.clinic_id !== undefined ? filters.clinic_id : null,
                    eventTypeFilter: filters.event_type !== undefined ? filters.event_type : null,
                    isLoading: false,
                  });
                },
                error: (err: any) => {
                  const msg = err.error?.detail || 'Fallo al recuperar los registros de auditoría.';
                  patchState(store, { error: msg, isLoading: false });
                  notification.builder().error().summary('Error de seguridad').detail(msg).show();
                },
              }),
            ),
          ),
        ),
      ),
    }),
  ),
);
