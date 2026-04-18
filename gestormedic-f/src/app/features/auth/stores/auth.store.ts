import { computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { pipe, switchMap, tap } from 'rxjs';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { tapResponse } from '@ngrx/operators';
import {
  AuthState,
  ForgotPasswordData,
  GoogleLoginData,
  LoginCredentials,
  RegisterData,
  ResetPasswordData,
  User,
} from '@core/models/auth.model';
import { Auth } from '@core/services/auth-service';
import { TwoFactor } from '@core/services/two-factor-service';
import { NotificationService } from '@core/services/notification';

function getInitialStatus(): 'loading' | 'unauthenticated' {
  if (typeof window !== 'undefined' && localStorage.getItem('gm_token')) {
    return 'loading';
  }
  return 'unauthenticated';
}

const initialState: AuthState = {
  user: null,
  status: getInitialStatus(),
  error: null,
  sessions: [],
  pendingSessionToken: null,
};

export const AuthStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed(({ status, user, sessions, pendingSessionToken }) => ({
    isAuthenticated: computed(() => status() === 'authenticated'),
    isLoading: computed(() => status() === 'loading'),
    currentUser: computed(() => user()),
    activeSessions: computed(() => sessions()),
    pendingSessionToken: computed(() => pendingSessionToken()),
    requires2FA: computed(() => status() === 'awaiting_2fa'),
  })),
  withMethods(
    (
      store,
      authService = inject(Auth),
      twoFactorService = inject(TwoFactor),
      router = inject(Router),
      notification = inject(NotificationService),
    ) => {
      const redirectByUserRole = (user: User) => {
        let route = '/portal/';
        if (user.is_admin || user.role_id === 1) {
          route = '/control/';
        } else if (user.role_id === 2 || user.role_id === 3) {
          route = '/app/';
        }
        router.navigate([route]);
      };

      const clearLocalState = () => {
        localStorage.removeItem('gm_token');
        patchState(store, initialState);
        window.location.href = '/auth/login';
      };

      const fetchUser = rxMethod<void>(
        pipe(
          tap(() => patchState(store, { status: 'loading' })),
          switchMap(() =>
            authService.getMe().pipe(
              tapResponse({
                next: (user) => {
                  patchState(store, { user, status: 'authenticated', error: null });
                  redirectByUserRole(user);
                },
                error: () => clearLocalState(),
              }),
            ),
          ),
        ),
      );

      return {
        fetchUser,
        login: rxMethod<LoginCredentials>(
          pipe(
            tap(() => patchState(store, { status: 'loading', error: null })),
            switchMap((credentials) =>
              authService.login(credentials).pipe(
                tapResponse({
                  next: (res) => {
                    if (res.session_token) {
                      patchState(store, {
                        status: 'awaiting_2fa',
                        pendingSessionToken: res.session_token,
                      });
                      router.navigate(['/auth/verify-2fa']);
                    } else if (res.access_token) {
                      localStorage.setItem('gm_token', res.access_token);
                      fetchUser();
                    }
                  },
                  error: (err: any) => {
                    const message = err.error?.detail || 'Error en la autenticación';
                    patchState(store, { status: 'error', error: message });
                    notification
                      .builder()
                      .error()
                      .summary('Fallo de acceso')
                      .detail(message)
                      .show();
                  },
                }),
              ),
            ),
          ),
        ),
        verify2FA: rxMethod<{ sessionToken: string; code: string }>(
          pipe(
            tap(() => patchState(store, { status: 'loading', error: null })),
            switchMap(({ sessionToken, code }) =>
              twoFactorService.verify({ session_token: sessionToken, code }).pipe(
                tapResponse({
                  next: (res) => {
                    if (res.access_token) {
                      patchState(store, { pendingSessionToken: null });
                      localStorage.setItem('gm_token', res.access_token);
                      fetchUser();
                    }
                  },
                  error: (err: any) => {
                    const message = err.error?.detail || 'Error en verificación 2FA';
                    patchState(store, { status: 'error', error: message });
                    notification
                      .builder()
                      .error()
                      .summary('Autenticación fallida')
                      .detail(message)
                      .show();
                  },
                }),
              ),
            ),
          ),
        ),
        cancel2FA: rxMethod<void>(
          pipe(
            tap(() => {
              patchState(store, {
                status: 'unauthenticated',
                pendingSessionToken: null,
                error: null,
              });
              router.navigate(['/auth/login']);
            }),
          ),
        ),
        register: rxMethod<RegisterData>(
          pipe(
            tap(() => patchState(store, { status: 'loading', error: null })),
            switchMap((data) =>
              authService.register(data).pipe(
                tapResponse({
                  next: () => {
                    patchState(store, { status: 'unauthenticated', error: null });
                    notification
                      .builder()
                      .success()
                      .summary('Registro exitoso')
                      .detail('Proceda a iniciar sesión con sus credenciales.')
                      .show();
                    router.navigate(['/auth/login']);
                  },
                  error: (err: any) => {
                    const message = err.error?.detail || 'Error en el registro';
                    patchState(store, { status: 'error', error: message });
                    notification
                      .builder()
                      .error()
                      .summary('No se pudo completar el registro')
                      .detail(message)
                      .show();
                  },
                }),
              ),
            ),
          ),
        ),
        loadSessions: rxMethod<void>(
          pipe(
            switchMap(() =>
              authService.getSessions().pipe(
                tapResponse({
                  next: (sessions) => patchState(store, { sessions }),
                  error: (err: any) => console.error(err),
                }),
              ),
            ),
          ),
        ),
        revokeSession: rxMethod<string>(
          pipe(
            switchMap((jti) =>
              authService.revokeSession(jti).pipe(
                tapResponse({
                  next: () => {
                    patchState(store, {
                      sessions: store.sessions().filter((s) => s.jti !== jti),
                    });
                    notification.builder().info().summary('Sesión revocada correctamente').show();
                  },
                  error: () => {
                    notification
                      .builder()
                      .error()
                      .summary('Error de sistema')
                      .detail('No se pudo revocar la sesión.')
                      .show();
                  },
                }),
              ),
            ),
          ),
        ),
        logout: rxMethod<void>(
          pipe(
            tap(() => patchState(store, { status: 'loading', error: null })),
            switchMap(() =>
              authService.logout().pipe(
                tapResponse({
                  next: () => clearLocalState(),
                  error: () => clearLocalState(),
                }),
              ),
            ),
          ),
        ),
        loginWithGoogle: rxMethod<GoogleLoginData>(
          pipe(
            tap(() => patchState(store, { status: 'loading', error: null })),
            switchMap((data) =>
              authService.loginGoogle(data).pipe(
                tapResponse({
                  next: (res) => {
                    if (res.access_token) {
                      localStorage.setItem('gm_token', res.access_token);
                      fetchUser();
                    }
                  },
                  error: (err: any) => {
                    const message = err.error?.detail || 'Error en la autenticación de Google';
                    patchState(store, { status: 'error', error: message });
                    notification
                      .builder()
                      .error()
                      .summary('Fallo de acceso')
                      .detail(message)
                      .show();
                  },
                }),
              ),
            ),
          ),
        ),
        requestPasswordReset: rxMethod<ForgotPasswordData>(
          pipe(
            tap(() => patchState(store, { status: 'loading', error: null })),
            switchMap((data) =>
              authService.forgotPassword(data).pipe(
                tapResponse({
                  next: () => {
                    patchState(store, { status: 'unauthenticated', error: null });
                    notification
                      .builder()
                      .success()
                      .summary('Solicitud enviada')
                      .detail('Revise su bandeja de entrada para continuar con la recuperación.')
                      .show();
                    router.navigate(['/auth/login']);
                  },
                  error: (err: any) => {
                    const message = err.error?.detail || 'Error al procesar la solicitud';
                    patchState(store, { status: 'error', error: message });
                    notification
                      .builder()
                      .error()
                      .summary('Fallo en la operación')
                      .detail(message)
                      .show();
                  },
                }),
              ),
            ),
          ),
        ),
        executePasswordReset: rxMethod<ResetPasswordData>(
          pipe(
            tap(() => patchState(store, { status: 'loading', error: null })),
            switchMap((data) =>
              authService.resetPassword(data).pipe(
                tapResponse({
                  next: () => {
                    patchState(store, { status: 'unauthenticated', error: null });
                    notification
                      .builder()
                      .success()
                      .summary('Contraseña actualizada')
                      .detail(
                        'Su clave de acceso ha sido modificada correctamente. Ya puede iniciar sesión.',
                      )
                      .show();
                    router.navigate(['/auth/login']);
                  },
                  error: (err: any) => {
                    const message = err.error?.detail || 'El enlace es inválido o ha expirado';
                    patchState(store, { status: 'error', error: message });
                    notification
                      .builder()
                      .error()
                      .summary('Error de validación')
                      .detail(message)
                      .show();
                  },
                }),
              ),
            ),
          ),
        ),
      };
    },
  ),
);
