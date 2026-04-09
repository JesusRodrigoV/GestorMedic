import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-patient-list',
  imports: [],
  templateUrl: './patient-list.html',
  styleUrl: './patient-list.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class PatientList {}
