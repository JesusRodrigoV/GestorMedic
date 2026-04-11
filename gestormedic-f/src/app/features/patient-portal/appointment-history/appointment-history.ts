import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-appointment-history',
  imports: [],
  templateUrl: './appointment-history.html',
  styleUrl: './appointment-history.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class AppointmentHistory {}
