import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'gm-image-viewer',
  templateUrl: './image-viewer.html',
  styleUrl: './image-viewer.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ImageViewer {
  readonly fileUrl = input.required<string>();
  readonly fileName = input<string>('Imagen');
}
