import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  OnInit,
  OnDestroy,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SocialService, ChatMessage } from '@core/services/social.service';
import { AuthStore } from '@features/auth/stores/auth.store';

@Component({
  selector: 'gm-chat',
  imports: [CommonModule, FormsModule],
  templateUrl: './chat.html',
  styleUrl: './chat.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChatComponent implements OnInit, OnDestroy {
  connectionId = input.required<number>();
  receiverId = input.required<number>();

  private socialService = inject(SocialService);
  private authStore = inject(AuthStore);

  readonly messages = signal<ChatMessage[]>([]);
  newMessage = '';

  ngOnInit(): void {
    const user = this.authStore.currentUser();
    if (user) {
      this.socialService.connectChat(user.id);
      this.socialService.onMessage().subscribe((msg) => {
        this.messages.update((prev) => [...prev, msg]);
      });
    }
  }

  ngOnDestroy(): void {
    this.socialService.disconnect();
  }

  send(): void {
    if (!this.newMessage.trim()) return;

    const user = this.authStore.currentUser();
    if (user) {
      this.socialService.sendMessage(this.connectionId(), this.receiverId(), this.newMessage);
      this.messages.update((prev) => [
        ...prev,
        {
          sender_id: user.id,
          content: this.newMessage,
          timestamp: new Date().toISOString(),
        },
      ]);
      this.newMessage = '';
    }
  }

  isMyMessage(senderId: number): boolean {
    const user = this.authStore.currentUser();
    return senderId === user?.id;
  }
}
