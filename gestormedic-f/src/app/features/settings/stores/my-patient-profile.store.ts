import { computed, inject } from '@angular/core';
import { pipe, switchMap, tap } from 'rxjs';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { tapResponse } from '@ngrx/operators';
import { NotificationService } from '@core/services/notification';
import { PatientProfile as PatientProfileModel, UpdatePatientProfilePayload } from '@core/models/patient-profile.model';
import { ProfilePatientService } from '@core/services/profile-patient-service';

type PatientProfileState = {
  profile: PatientProfileModel | null;
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
      profileService = inject(ProfilePatientService),
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
              })
            )
          )
        )
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
                    .summary('Expediente actualizado')
                    .detail('Su información biométrica y de contacto ha sido guardada exitosamente.')
                    .show();
                },
                error: (err: any) => {
                  const msg = err.error?.detail || 'Los datos proporcionados no cumplen con el formato requerido.';
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