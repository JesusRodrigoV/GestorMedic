import { computed, inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { tap } from 'rxjs';
import { AuthState } from '@core/models/auth.model';
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

  user = computed(() => this.state().user);
  isAuthenticated = computed(() => this.state().status === 'authenticated');
  isLoading = computed(() => this.state().status === 'loading');

  login(credentials: any) {
    this.state.update((s) => ({ ...s, status: 'loading' }));

    return this.authService.login(credentials).pipe(
      tap({
        next: (res) => {
          localStorage.setItem('gm_token', res.access_token);
          this.fetchUser();
        },
        error: (err) => this.state.update((s) => ({ ...s, status: 'error', error: err.message })),
      }),
    );
  }

  updateProfile(data: any) {
    this.state.update((s) => ({ ...s, status: 'loading' }));

    return this.authService.updateProfile(data).pipe(
      tap({
        next: (updatedUser) => {
          this.state.update((s) => ({
            ...s,
            user: updatedUser,
            status: 'authenticated',
            error: null,
          }));
        },
        error: (err) => {
          this.state.update((s) => ({ ...s, status: 'error', error: err.message }));
        },
      }),
    );
  }

  fetchUser() {
    this.authService.getMe().subscribe({
      next: (user) => {
        console.group('AuthStore: FetchUser Success');
        console.log('Datos recibidos del servidor:', user);
        console.groupEnd();
        this.state.update((s) => ({ ...s, user, status: 'authenticated' }));
        this.router.navigate(['/app/dashboard']);
      },
      error: () => this.logout(),
    });
  }

  logout() {
    this.authService.logout().subscribe(() => {
      localStorage.removeItem('gm_token');
      this.state.set({ user: null, status: 'unauthenticated', error: null });
      this.router.navigate(['/auth/login']);
    });
  }
}
