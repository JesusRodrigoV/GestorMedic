import { computed, inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, EMPTY, tap } from 'rxjs';
import { AuthState, LoginCredentials, User } from '@core/models/auth.model';
import { Auth } from '@core/services/auth';

@Injectable({
  providedIn: 'root',
})
export class AuthStore {
  private authService = inject(Auth);
  private router = inject(Router);

  private state = signal<AuthState>({
    user: null,
    status: 'unauthenticated',
    error: null,
  });

  readonly user = computed(() => this.state().user);
  readonly status = computed(() => this.state().status);
  readonly isAuthenticated = computed(() => this.state().status === 'authenticated');
  readonly isLoading = computed(() => this.state().status === 'loading');
  readonly error = computed(() => this.state().error);

  login(credentials: LoginCredentials) {
    this.state.update((s) => ({ ...s, status: 'loading', error: null }));

    return this.authService.login(credentials).pipe(
      tap((res) => {
        localStorage.setItem('gm_token', res.access_token);
        this.fetchUser(); 
      }),
      catchError((err) => {
        const message = err.error?.detail || 'Error en la autenticación';
        this.state.update((s) => ({ ...s, status: 'error', error: message }));
        return EMPTY;
      }),
    );
  }

  private redirectByUserRole(user: User) {
    let route = '/portal/appointments';
    if (user.is_admin || user.role_id === 1) {
      route = '/control/management';
    } else if (user.role_id === 2 || user.role_id === 3) {
      route = '/app/dashboard';
    }
    this.router.navigate([route]);
  }

  logout() {
    this.authService
      .logout()
      .pipe(
        tap(() => this.clearLocalState()),
        catchError(() => {
          this.clearLocalState();
          return EMPTY;
        }),
      )
      .subscribe();
  }

  fetchUser() {
    this.state.update((s) => ({ ...s, status: 'loading' }));

    this.authService.getMe().subscribe({
      next: (user) => {
        this.state.update((s) => ({
          ...s,
          user,
          status: 'authenticated',
          error: null,
        }));
        this.redirectByUserRole(user);
      },
      error: () => this.logout(),
    });
  }

  private clearLocalState() {
    localStorage.removeItem('gm_token');
    this.state.set({ user: null, status: 'unauthenticated', error: null });
    this.router.navigate(['/auth/login']);
  }
}
