import { ChangeDetectionStrategy, Component, signal } from '@angular/core';

@Component({
  selector: 'gm-directory-top-cities',
  imports: [],
  templateUrl: './directory-top-cities.html',
  styleUrl: './directory-top-cities.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'gm-top-cities-host' },
})
export class DirectoryTopCities {
  cities = signal([
    { id: 'la-paz', name: 'La Paz', doctors: 124 },
    { id: 'cochabamba', name: 'Cochabamba', doctors: 98 },
    { id: 'santa-cruz', name: 'Santa Cruz', doctors: 210 },
    { id: 'sucre', name: 'Sucre', doctors: 46 },
  ]);
}
