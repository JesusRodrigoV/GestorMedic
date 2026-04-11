import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-management',
  imports: [],
  templateUrl: './management.html',
  styleUrl: './management.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class Management {}
