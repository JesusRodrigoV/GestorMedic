import { computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { pipe, switchMap, tap } from 'rxjs';
import {
  patchState,
  signalStore,
  withComputed,
  withMethods,
  withState,
} from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { tapResponse } from '@ngrx/operators';
import { AuthState, LoginCredentials, RegisterData, User, UserSession } from '@core/models/auth.model';
import { Auth } from '@core/services/auth';
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
};

export const AuthStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed(({ status, user, sessions }) => ({
    isAuthenticated: computed(() => status() === 'authenticated'),
    isLoading: computed(() => status() === 'loading'),
    currentUser: computed(() => user()),
    activeSessions: computed(() => sessions()),
  })),
  withMethods(
    (
      store,
      authService = inject(Auth),
      router = inject(Router),
      notification = inject(NotificationService)
    ) => {
      const redirectByUserRole = (user: User) => {
        let route = '/portal/';
        if (user.is_admin || user.role_id === 1) {
          route = '/control/management';
        } else if (user.role_id === 2 || user.role_id === 3) {
          route = '/app/dashboard';
        }
        router.navigate([route]);
      };

      const clearLocalState = () => {
        localStorage.removeItem('gm_token');
        patchState(store, initialState);
        router.navigate(['/auth/login']);
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
              })
            )
          )
        )
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
                    localStorage.setItem('gm_token', res.access_token);
                    fetchUser();
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
                })
              )
            )
          )
        ),
        verify2FA: rxMethod<{ sessionToken: string; code: string }>(
          pipe(
            tap(() => patchState(store, { status: 'loading', error: null })),
            switchMap(({ sessionToken, code }) =>
              authService.verify2FA(sessionToken, code).pipe(
                tapResponse({
                  next: (res) => {
                    localStorage.setItem('gm_token', res.access_token);
                    fetchUser();
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
                })
              )
            )
          )
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
                })
              )
            )
          )
        ),
        loadSessions: rxMethod<void>(
          pipe(
            switchMap(() =>
              authService.getSessions().pipe(
                tapResponse({
                  next: (sessions) => patchState(store, { sessions }),
                  error: (err: any) => console.error(err),
                })
              )
            )
          )
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
                    notification
                      .builder()
                      .info()
                      .summary('Sesión revocada correctamente')
                      .show();
                  },
                  error: (err: any) => {
                    notification
                      .builder()
                      .error()
                      .summary('Error de sistema')
                      .detail('No se pudo revocar la sesión.')
                      .show();
                  },
                })
              )
            )
          )
        ),
        logout: rxMethod<void>(
          pipe(
            switchMap(() =>
              authService.logout().pipe(
                tapResponse({
                  next: () => clearLocalState(),
                  error: () => clearLocalState(),
                })
              )
            )
          )
        ),
      };
    }
  )
);