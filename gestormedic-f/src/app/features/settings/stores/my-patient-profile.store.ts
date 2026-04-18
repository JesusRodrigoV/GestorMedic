import { computed, inject } from '@angular/core';
import { pipe, switchMap, tap } from 'rxjs';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { tapResponse } from '@ngrx/operators';
import { NotificationService } from '@core/services/notification';
import { PatientProfile, UpdatePatientProfilePayload } from '@core/models/patient-profile.model';
import { PatientProfileService } from '@core/services/patient-profile-service';

type PatientProfileState = {
  profile: PatientProfile | null;
  isLoading: boolean;
  error: string | null;
};

const initialState: PatientProfileState = {
  profile: null,
  isLoading: false,
  error: null,
};

export const MyPatientProfileStore = signalStore(
  withState(initialState),
  withComputed(({ profile, isLoading }) => ({
    currentProfile: computed(() => profile()),
    isProcessing: computed(() => isLoading()),
  })),
  withMethods(
    (
      store,
      profileService = inject(PatientProfileService),
      notification = inject(NotificationService),
    ) => ({
      loadProfile: rxMethod<void>(
        pipe(
          tap(() => patchState(store, { isLoading: true, error: null })),
          switchMap(() =>
            profileService.getMyProfile().pipe(
              tapResponse({
                next: (profile) => patchState(store, { profile, isLoading: false }),
                error: (err: any) => {
                  // If the profile is not found (404) treat as 'profile not created yet' and do not show an error notification
                  if (err && err.status === 404) {
                    patchState(store, { profile: null, isLoading: false, error: null });
                    // optional: show an informational message to guide the user
                    notification
                      .builder()
                      .info()
                      .summary('Perfil incompleto')
                      .detail('No se ha creado el perfil de paciente. Complete sus datos desde Configuración.')
                      .show();
                    return;
                  }

                  const msg = err.error?.detail || 'Fallo de lectura en el registro clínico.';
                  patchState(store, { error: msg, isLoading: false });
                  notification.builder().error().summary('Error de sistema').detail(msg).show();
                },
              }),
            ),
          ),
        ),
      ),
      updateProfile: rxMethod<UpdatePatientProfilePayload>(
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
                    .summary('Perfil actualizado')
                    .detail('La información médica ha sido guardada en el archivo central.')
                    .show();
                },
                error: (err: any) => {
                  const msg =
                    err.error?.detail ||
                    'Los datos proporcionados no cumplen los criterios de validación.';
                  patchState(store, { error: msg, isLoading: false });
                  notification.builder().error().summary('Error de validación').detail(msg).show();
                },
              }),
            ),
          ),
        ),
      ),
    }),
  ),
);
