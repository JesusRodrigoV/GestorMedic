import { ChangeDetectionStrategy, Component, inject, signal, OnInit, ElementRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { NotificationService } from '@core/services/notification';
import { RoundedButton } from '@shared/ui/rounded-button';
import { MultiSelect } from 'primeng/multiselect';

@Component({
  selector: 'gm-hero',
  imports: [RoundedButton, MultiSelect, FormsModule],
  templateUrl: './hero.html',
  styleUrl: './hero.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'gm-hero-host',
  },
})
export class Hero {
  private notificationService = inject(NotificationService);
  router = inject(Router);
  private readonly host = inject(ElementRef<HTMLElement>);

  ngOnInit(): void {
    // run a lightweight hero entrance animation after view init
    setTimeout(() => this.runHeroAnimation(), 0);
  }

  specialties = signal([
    { name: 'Cardiología' },
    { name: 'Dermatología' },
    { name: 'Ginecología' },
    { name: 'Pediatría' },
    { name: 'Psiquiatría' },
    { name: 'Traumatología' },
  ]);

  selectedSpecialties = signal<any[]>([]);

  onSearch(): void {
    const selected = this.selectedSpecialties();
    const queryParams: Record<string, string> = {};

    if (selected && selected.length > 0) {
      queryParams['specialty'] = selected.map((s) => s.name.toLowerCase()).join(',');
    }

    this.router.navigate(['/search'], { queryParams });
  }

  onStartTrial(): void {
    this.notificationService
      .builder()
      .success()
      .summary('Proceso Iniciado')
      .detail('Preparando el entorno seguro para su nueva cuenta.')
      .show();
  }

  private runHeroAnimation(): void {
    try {
      gsap.registerPlugin(ScrollTrigger);
    } catch (e) {
      // ignore if plugin already registered or not available
    }

    const root = this.host?.nativeElement;
    if (!root) return;

    const title = root.querySelector('.gm-hero-title');
    const search = root.querySelector('.gm-search-container');
    const mocks = root.querySelectorAll('.gm-bento-mock');

    const elems: Element[] = [];
    if (title) elems.push(title);
    if (search) elems.push(search);
    mocks.forEach((m) => elems.push(m));

    if (!elems.length) return;

    gsap.set(elems, { y: 30, opacity: 0 });

    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    if (title) tl.to(title, { y: 0, opacity: 1, duration: 0.8 });
    if (search) tl.to(search, { y: 0, opacity: 1, duration: 0.6 }, '-=0.45');
    if (mocks && mocks.length) tl.to(mocks, { y: 0, opacity: 1, stagger: 0.12, duration: 0.7 }, '-=0.4');
  }
}
