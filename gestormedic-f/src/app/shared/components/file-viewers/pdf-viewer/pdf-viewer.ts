import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'gm-pdf-viewer',
  templateUrl: './pdf-viewer.html',
  styleUrl: './pdf-viewer.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PdfViewer {
  readonly fileUrl = input.required<string>();
}
