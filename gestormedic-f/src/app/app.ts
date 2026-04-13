import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthStore } from '@features/auth/stores/auth.store';
import { Toast } from 'primeng/toast';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, Toast],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App implements OnInit {
  private authStore = inject(AuthStore);
  protected readonly title = signal('gestormedic-f');

  ngOnInit(): void {
    const token = localStorage.getItem('gm_token');
    if (token) {
      this.authStore.fetchUser();
    }
  }
}
