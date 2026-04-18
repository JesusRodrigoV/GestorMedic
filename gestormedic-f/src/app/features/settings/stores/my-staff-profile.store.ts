import { computed, inject } from '@angular/core';
import { pipe, switchMap, tap } from 'rxjs';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { tapResponse } from '@ngrx/operators';
import { ProfileStaffService } from '@core/services/profile-staff-service';
import { NotificationService } from '@core/services/notification';
import { StaffProfile as StaffProfileModel, UpdateStaffProfilePayload } from '@core/models/staff-profile.model';

type StaffProfileState = {
  profile: StaffProfileModel | null;
  isLoading: boolean;
  error: string | null;
};

const initialState: StaffProfileState = {
  profile: null,
  isLoading: false,
  error: null,
};

export const MyStaffProfileStore = signalStore(
  withState(initialState),
  withComputed(({ profile, isLoading }) => ({
    currentProfile: computed(() => profile()),
    isProcessing: computed(() => isLoading()),
  })),
  withMethods(
    (
      store,
      profileService = inject(ProfileStaffService),
      notification = inject(NotificationService)
    ) => ({
      loadProfile: rxMethod<void>(
        pipe(
          tap(() => patchState(store, { isLoading: true, error: null })),
          switchMap(() =>
            profileService.getMyProfile().pipe(
              tapResponse({
                next: (profile) => patchState(store, { profile, isLoading: false }),
                error: (err: any) => {
                  const msg = err.error?.detail || 'Fallo de lectura en el expediente de empleado.';
                  patchState(store, { error: msg, isLoading: false });
                  notification.builder().error().summary('Error de sistema').detail(msg).show();
                },
              })
            )
          )
        )
      ),
      updateProfile: rxMethod<UpdateStaffProfilePayload>(
        pipe(
          tap(() => patchState(store, { isLoading: true, error: null })),
          switchMap((payload) =>
            profileService.updateMyProfile(payload).pipe(
              tapResponse({
                next: (profile) => {
                  patchState(store, { profile, isLoading: false });
                  notification
                    .builder()
                    .success()
                    .summary('Expediente actualizado')
                    .detail('Su información laboral ha sido guardada exitosamente.')
                    .show();
                },
                error: (err: any) => {
                  const msg = err.error?.detail || 'Los datos proporcionados son inválidos.';
                  patchState(store, { error: msg, isLoading: false });
                  notification.builder().error().summary('Error de validación').detail(msg).show();
                },
              })
            )
          )
        )
      )
    })
  )
);