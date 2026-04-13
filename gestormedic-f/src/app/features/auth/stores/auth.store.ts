import { computed, inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, tap, throwError } from 'rxjs';
import {
  AppearanceSettingsPayload,
  AuthState,
  NotificationSettingsPayload,
  UpdateProfilePayload,
  User,
} from '@core/models/auth.model';
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
          this.fetchUser(true);
        },
      }),
      catchError((err) => {
        this.state.update((s) => ({ ...s, status: 'error', error: err.message }));
        return throwError(() => err);
      })
    );
  }

  private setAuthenticatedUser(user: User) {
    this.state.update((s) => ({
      ...s,
      user,
      status: 'authenticated',
      error: null,
    }));
  }

  updateProfile(data: UpdateProfilePayload) {
    this.state.update((s) => ({ ...s, status: 'loading' }));

    return this.authService.updateProfile(data).pipe(
      tap({
        next: (updatedUser) => {
          this.setAuthenticatedUser(updatedUser);
        },
      }),
      catchError((err) => {
        this.state.update((s) => ({ ...s, status: 'error', error: err.message }));
        return throwError(() => err);
      })
    );
  }

  updateNotificationPreferences(data: NotificationSettingsPayload) {
    this.state.update((s) => ({ ...s, status: 'loading' }));

    return this.authService.updateNotifications(data).pipe(
      tap({
        next: (updatedUser) => {
          this.setAuthenticatedUser(updatedUser);
        },
      }),
      catchError((err) => {
        this.state.update((s) => ({ ...s, status: 'error', error: err.message }));
        return throwError(() => err);
      })
    );
  }

  updateAppearancePreferences(data: AppearanceSettingsPayload) {
    this.state.update((s) => ({ ...s, status: 'loading' }));

    return this.authService.updateAppearance(data).pipe(
      tap({
        next: (updatedUser) => {
          this.setAuthenticatedUser(updatedUser);
        },
      }),
      catchError((err) => {
        this.state.update((s) => ({ ...s, status: 'error', error: err.message }));
        return throwError(() => err);
      })
    );
  }

  fetchUser(redirectToDashboard = false) {
    this.authService.getMe().subscribe({
      next: (user) => {
        this.setAuthenticatedUser(user);
        if (redirectToDashboard) {
          this.router.navigate([user.role_id === 3 ? '/portal/appointments' : '/app/dashboard']);
        }
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
