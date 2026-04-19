import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'gm-generic-viewer',
  templateUrl: './generic-viewer.html',
  styleUrl: './generic-viewer.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GenericViewer {
  readonly fileUrl = input.required<string>();
}
