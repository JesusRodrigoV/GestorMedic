import { computed, inject } from '@angular/core';
import { pipe, switchMap, tap } from 'rxjs';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { tapResponse } from '@ngrx/operators';
import { NotificationService } from '@core/services/notification';
import { DoctorProfile as DoctorProfileModel, UpdateDoctorProfilePayload } from '@core/models/doctor-profile.model';
import { ProfileDoctorService } from '@core/services/profile-doctor-service';

type DoctorProfileState = {
  profile: DoctorProfileModel | null;
  isLoading: boolean;
  error: string | null;
};

const initialState: DoctorProfileState = {
  profile: null,
  isLoading: false,
  error: null,
};

export const MyDoctorProfileStore = signalStore(
  withState(initialState),
  withComputed(({ profile, isLoading }) => ({
    currentProfile: computed(() => profile()),
    isProcessing: computed(() => isLoading()),
  })),
  withMethods(
    (
      store,
      profileService = inject(ProfileDoctorService),
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
                  const msg = err.error?.detail || 'Fallo de lectura en el registro profesional.';
                  patchState(store, { error: msg, isLoading: false });
                  notification.builder().error().summary('Error de sistema').detail(msg).show();
                },
              })
            )
          )
        )
      ),
      updateProfile: rxMethod<UpdateDoctorProfilePayload>(
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
                    .summary('Perfil profesional actualizado')
                    .detail('La información ha sido guardada exitosamente.')
                    .show();
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

      createProfile: rxMethod<UpdateDoctorProfilePayload>(
        pipe(
          tap(() => patchState(store, { isLoading: true, error: null })),
          switchMap((payload) =>
            profileService.createOnboarding(payload).pipe(
              tapResponse({
                next: (profile) => {
                  patchState(store, { profile, isLoading: false });
                  notification
                    .builder()
                    .success()
                    .summary('Perfil profesional creado')
                    .detail('Su registro profesional ha sido creado.')
                    .show();
                },
                error: (err: any) => {
                  const msg = err.error?.detail || 'No se pudo crear el perfil profesional.';
                  patchState(store, { error: msg, isLoading: false });
                  notification.builder().error().summary('Error al crear perfil').detail(msg).show();
                },
              })
            )
          )
        )
      )
    })
  )
);
