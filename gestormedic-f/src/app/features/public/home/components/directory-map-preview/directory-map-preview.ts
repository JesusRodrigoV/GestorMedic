import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'gm-directory-map-preview',
  imports: [],
  templateUrl: './directory-map-preview.html',
  styleUrl: './directory-map-preview.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'gm-map-preview-host' },
})
export class DirectoryMapPreview {}
