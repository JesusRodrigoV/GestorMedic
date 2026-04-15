import { computed, inject } from '@angular/core';
import { pipe, switchMap, tap } from 'rxjs';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { tapResponse } from '@ngrx/operators';
import { TwoFactor } from '@core/services/two-factor';
import { NotificationService } from '@core/services/notification';
import { TwoFAConfirmPayload, TwoFASetupResponse } from '@core/models/two-factor.model';

type TwoFactorState = {
  setupData: TwoFASetupResponse | null;
  isLoading: boolean;
  error: string | null;
  isConfirmed: boolean;
};

const initialState: TwoFactorState = {
  setupData: null,
  isLoading: false,
  error: null,
  isConfirmed: false,
};

export const TwoFactorStore = signalStore(
  withState(initialState),
  withComputed(({ setupData, isLoading, isConfirmed }) => ({
    qrCodeUri: computed(() => setupData()?.qr_code_uri ?? null),
    secretKey: computed(() => setupData()?.secret ?? null),
    backupCodes: computed(() => setupData()?.backup_codes ?? []),
    isProcessing: computed(() => isLoading()),
    setupComplete: computed(() => isConfirmed()),
  })),
  withMethods(
    (store, twoFactorService = inject(TwoFactor), notification = inject(NotificationService)) => ({
      initSetup: rxMethod<void>(
        pipe(
          tap(() => patchState(store, { isLoading: true, error: null, isConfirmed: false })),
          switchMap(() =>
            twoFactorService.setup().pipe(
              tapResponse({
                next: (setupData) => patchState(store, { setupData, isLoading: false }),
                error: (err: any) => {
                  const msg = err.error?.detail || 'Error al generar credenciales de seguridad';
                  patchState(store, { error: msg, isLoading: false });
                  notification
                    .builder()
                    .error()
                    .summary('Fallo en la operación')
                    .detail(msg)
                    .show();
                },
              }),
            ),
          ),
        ),
      ),
      confirmSetup: rxMethod<TwoFAConfirmPayload>(
        pipe(
          tap(() => patchState(store, { isLoading: true, error: null })),
          switchMap((payload) =>
            twoFactorService.confirm(payload).pipe(
              tapResponse({
                next: () => {
                  patchState(store, { isLoading: false, isConfirmed: true });
                  notification
                    .builder()
                    .success()
                    .summary('Seguridad actualizada')
                    .detail('La autenticación de dos factores ha sido activada correctamente.')
                    .show();
                },
                error: (err: any) => {
                  const msg = err.error?.detail || 'El código de confirmación es inválido';
                  patchState(store, { error: msg, isLoading: false });
                  notification.builder().error().summary('Validación fallida').detail(msg).show();
                },
              }),
            ),
          ),
        ),
      ),
    }),
  ),
);
