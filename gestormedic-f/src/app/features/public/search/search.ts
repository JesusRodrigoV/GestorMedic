import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CheckboxModule } from 'primeng/checkbox';
import { SliderModule } from 'primeng/slider';
import { RatingModule } from 'primeng/rating';
import { RoundedButton } from '@shared/ui/rounded-button';
import { CurrencyPipe, NgOptimizedImage } from '@angular/common';
import { Doctor } from '@core/models/doctor.model';

@Component({
  selector: 'gm-search',
  imports: [
    FormsModule,
    CheckboxModule,
    SliderModule,
    RatingModule,
    RoundedButton,
    CurrencyPipe,
    NgOptimizedImage,
  ],
  templateUrl: './search.html',
  styleUrl: './search.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'gm-search-host',
  },
})
export default class Search {
  specialty = input<string>('');
  location = input<string>('');

  protected readonly maxPrice = signal<number>(500);
  protected readonly selectedModalities = signal<string[]>([]);

  private readonly _directory = signal<Doctor[]>([
    {
      id: '1',
      name: 'Dr. Roberto Mendoza',
      specialty: 'pediatria',
      location: 'zona-sur',
      price: 250,
      rating: 5,
      reviews: 124,
      experience: 15,
      avatar: 'assets/doctors/doc1.jpg',
      modality: 'presencial',
    },
    {
      id: '2',
      name: 'Dra. Elena Villarroel',
      specialty: 'cardiologia',
      location: 'sopocachi',
      price: 350,
      rating: 4,
      reviews: 89,
      experience: 12,
      avatar: 'assets/doctors/doc2.jpg',
      modality: 'ambas',
    },
    {
      id: '3',
      name: 'Dr. Carla C. Arce',
      specialty: 'pediatria',
      location: 'centro',
      price: 150,
      rating: 4,
      reviews: 56,
      experience: 8,
      avatar: 'assets/doctors/doc3.jpg',
      modality: 'online',
    },
  ]);

  protected readonly filteredDoctors = computed(() => {
    const currentSpecialty = this.specialty()?.toLowerCase();
    const currentLocation = this.location()?.toLowerCase();
    const priceLimit = this.maxPrice();
    const modalities = this.selectedModalities();

    return this._directory().filter((doc) => {
      const matchSpecialty = !currentSpecialty || doc.specialty === currentSpecialty;
      const matchLocation = !currentLocation || doc.location === currentLocation;
      const matchPrice = doc.price <= priceLimit;
      const matchModality =
        modalities.length === 0 || modalities.includes(doc.modality) || doc.modality === 'ambas';

      return matchSpecialty && matchLocation && matchPrice && matchModality;
    });
  });

  protected onBookAppointment(doctorId: string): void {
    console.log('Iniciando flujo de reserva para el doctor:', doctorId);
  }
}
