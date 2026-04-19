import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'gm-docx-viewer',
  templateUrl: './docx-viewer.html',
  styleUrl: './docx-viewer.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DocxViewer {
  readonly fileUrl = input.required<string>();
  readonly fileName = input<string>('Documento DOCX');
}
