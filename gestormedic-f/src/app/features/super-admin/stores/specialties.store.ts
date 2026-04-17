import { computed, inject } from '@angular/core';
import { pipe, switchMap, tap } from 'rxjs';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { tapResponse } from '@ngrx/operators';
import { SpecialtiesService } from '@core/services/specialties-service';
import { NotificationService } from '@core/services/notification';
import { Specialty, SpecialtyPayload } from '@core/models/specialty.model';

type SpecialtiesState = {
  items: Specialty[];
  total: number;
  page: number;
  size: number;
  searchQuery: string;
  isLoading: boolean;
  error: string | null;
};

const initialState: SpecialtiesState = {
  items: [],
  total: 0,
  page: 1,
  size: 10,
  searchQuery: '',
  isLoading: false,
  error: null,
};

export const SpecialtiesStore = signalStore(
  withState(initialState),
  withComputed(({ items, total, isLoading, page, size, searchQuery }) => ({
    specialtiesList: computed(() => items()),
    totalRecords: computed(() => total()),
    isProcessing: computed(() => isLoading()),
    currentPage: computed(() => page()),
    pageSize: computed(() => size()),
    currentSearch: computed(() => searchQuery()),
  })),
  withMethods(
    (store, specialtiesService = inject(SpecialtiesService), notification = inject(NotificationService)) => ({
      loadSpecialties: rxMethod<{ page: number; size: number; search: string }>(
        pipe(
          tap(() => patchState(store, { isLoading: true, error: null })),
          switchMap((filters) =>
            specialtiesService.list(filters).pipe(
              tapResponse({
                next: (res) => {
                  patchState(store, {
                    items: res.items,
                    total: res.total,
                    page: filters.page,
                    size: filters.size,
                    searchQuery: filters.search,
                    isLoading: false,
                  });
                },
                error: (err: any) => {
                  const msg = err.error?.detail || 'Fallo de lectura en el catálogo central.';
                  patchState(store, { error: msg, isLoading: false });
                  notification.builder().error().summary('Error de sistema').detail(msg).show();
                },
              })
            )
          )
        )
      )
    })
  ),
  withMethods(
    (store, specialtiesService = inject(SpecialtiesService), notification = inject(NotificationService)) => ({
      createSpecialty: rxMethod<SpecialtyPayload>(
        pipe(
          tap(() => patchState(store, { isLoading: true, error: null })),
          switchMap((payload) =>
            specialtiesService.create(payload).pipe(
              tapResponse({
                next: () => {
                  notification.builder().success().summary('Especialidad registrada').show();
                  store.loadSpecialties({
                    page: 1,
                    size: store.pageSize(),
                    search: store.currentSearch()
                  });
                },
                error: (err: any) => {
                  const msg = err.error?.detail || 'Los datos proporcionados no son válidos.';
                  patchState(store, { error: msg, isLoading: false });
                  notification.builder().error().summary('Error de validación').detail(msg).show();
                },
              })
            )
          )
        )
      ),
      updateSpecialty: rxMethod<{ id: number; payload: SpecialtyPayload }>(
        pipe(
          tap(() => patchState(store, { isLoading: true, error: null })),
          switchMap(({ id, payload }) =>
            specialtiesService.update(id, payload).pipe(
              tapResponse({
                next: () => {
                  notification.builder().success().summary('Catálogo actualizado').show();
                  store.loadSpecialties({
                    page: store.currentPage(),
                    size: store.pageSize(),
                    search: store.currentSearch()
                  });
                },
                error: (err: any) => {
                  const msg = err.error?.detail || 'Error al actualizar el registro.';
                  patchState(store, { error: msg, isLoading: false });
                  notification.builder().error().summary('Error de operación').detail(msg).show();
                },
              })
            )
          )
        )
      ),
      deleteSpecialty: rxMethod<number>(
        pipe(
          tap(() => patchState(store, { isLoading: true, error: null })),
          switchMap((id) =>
            specialtiesService.delete(id).pipe(
              tapResponse({
                next: () => {
                  notification.builder().info().summary('Registro eliminado del sistema').show();
                  store.loadSpecialties({
                    page: 1,
                    size: store.pageSize(),
                    search: store.currentSearch()
                  });
                },
                error: (err: any) => {
                  const msg = err.error?.detail || 'No se pudo eliminar el registro.';
                  patchState(store, { error: msg, isLoading: false });
                  notification.builder().error().summary('Operación denegada').detail(msg).show();
                },
              })
            )
          )
        )
      )
    })
  )
);