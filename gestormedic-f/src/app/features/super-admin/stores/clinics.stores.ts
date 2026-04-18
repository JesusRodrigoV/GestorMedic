import { computed, inject } from '@angular/core';
import { pipe, switchMap, tap } from 'rxjs';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { tapResponse } from '@ngrx/operators';
import { ClinicsService } from '@core/services/clinics-service';
import { NotificationService } from '@core/services/notification';
import { Clinic, ClinicPayload, ClinicQueryParams } from '@core/models/clinic.model';

type ClinicsState = {
  items: Clinic[];
  total: number;
  page: number;
  size: number;
  isActiveFilter: boolean | null;
  isLoading: boolean;
  error: string | null;
};

const initialState: ClinicsState = {
  items: [],
  total: 0,
  page: 1,
  size: 10,
  isActiveFilter: null,
  isLoading: false,
  error: null,
};

export const ClinicsStore = signalStore(
  withState(initialState),
  withComputed(({ items, total, isLoading, page, size, isActiveFilter }) => ({
    clinicsList: computed(() => items()),
    totalRecords: computed(() => total()),
    isProcessing: computed(() => isLoading()),
    currentPage: computed(() => page()),
    pageSize: computed(() => size()),
    currentFilter: computed(() => isActiveFilter()),
  })),
  withMethods(
    (
      store,
      clinicsService = inject(ClinicsService),
      notification = inject(NotificationService),
    ) => ({
      loadClinics: rxMethod<ClinicQueryParams>(
        pipe(
          tap(() => patchState(store, { isLoading: true, error: null })),
          switchMap((filters) =>
            clinicsService.list(filters).pipe(
              tapResponse({
                next: (res) => {
                  patchState(store, {
                    items: res.items,
                    total: res.total,
                    page: filters.page || 1,
                    size: filters.size || 10,
                    isActiveFilter: filters.is_active !== undefined ? filters.is_active : null,
                    isLoading: false,
                  });
                },
                error: (err: any) => {
                  const msg = err.error?.detail || 'Fallo al recuperar la lista de inquilinos.';
                  patchState(store, { error: msg, isLoading: false });
                  notification.builder().error().summary('Error del sistema').detail(msg).show();
                },
              }),
            ),
          ),
        ),
      ),
    }),
  ),
  withMethods(
    (
      store,
      clinicsService = inject(ClinicsService),
      notification = inject(NotificationService),
    ) => ({
      createClinic: rxMethod<ClinicPayload>(
        pipe(
          tap(() => patchState(store, { isLoading: true, error: null })),
          switchMap((payload) =>
            clinicsService.create(payload).pipe(
              tapResponse({
                next: () => {
                  notification.builder().success().summary('Inquilino registrado').show();
                  store.loadClinics({
                    page: 1,
                    size: store.pageSize(),
                    is_active: store.currentFilter(),
                  });
                },
                error: (err: any) => {
                  const msg = err.error?.detail || 'Los datos del inquilino son inválidos.';
                  patchState(store, { error: msg, isLoading: false });
                  notification.builder().error().summary('Error de registro').detail(msg).show();
                },
              }),
            ),
          ),
        ),
      ),
      updateClinic: rxMethod<{ id: number; payload: ClinicPayload }>(
        pipe(
          tap(() => patchState(store, { isLoading: true, error: null })),
          switchMap(({ id, payload }) =>
            clinicsService.update(id, payload).pipe(
              tapResponse({
                next: () => {
                  notification.builder().success().summary('Inquilino actualizado').show();
                  store.loadClinics({
                    page: store.currentPage(),
                    size: store.pageSize(),
                    is_active: store.currentFilter(),
                  });
                },
                error: (err: any) => {
                  const msg = err.error?.detail || 'Fallo al actualizar los datos.';
                  patchState(store, { error: msg, isLoading: false });
                  notification.builder().error().summary('Operación fallida').detail(msg).show();
                },
              }),
            ),
          ),
        ),
      ),
      deleteClinic: rxMethod<number>(
        pipe(
          tap(() => patchState(store, { isLoading: true, error: null })),
          switchMap((id) =>
            clinicsService.delete(id).pipe(
              tapResponse({
                next: () => {
                  notification.builder().info().summary('Inquilino eliminado').show();
                  store.loadClinics({
                    page: 1,
                    size: store.pageSize(),
                    is_active: store.currentFilter(),
                  });
                },
                error: (err: any) => {
                  const msg = err.error?.detail || 'No se puede eliminar este registro.';
                  patchState(store, { error: msg, isLoading: false });
                  notification.builder().error().summary('Acción denegada').detail(msg).show();
                },
              }),
            ),
          ),
        ),
      ),
    }),
  ),
);
