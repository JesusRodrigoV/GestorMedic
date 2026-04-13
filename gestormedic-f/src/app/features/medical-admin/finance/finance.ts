import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { RoundedButton } from '@shared/ui/rounded-button/rounded-button';
import { ChartModule } from 'primeng/chart';

@Component({
  selector: 'app-finance',
  standalone: true,
  imports: [CommonModule, CardModule, TableModule, TagModule, RoundedButton, ChartModule],
  templateUrl: './finance.html',
  styleUrl: './finance.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class FinanceComponent {
  stats = [
    { label: 'Total Mes', value: '$12,450', change: '+12%', color: 'green' },
    { label: 'Pendiente Cobro', value: '$1,200', change: '-5%', color: 'orange' },
    { label: 'Promedio Consulta', value: '$85', change: 'Estable', color: 'blue' }
  ];

  invoices = [
    { id: '#INV-1024', patient: 'Elena García', date: '2024-03-20', amount: '$150', status: 'Pagado' },
    { id: '#INV-1025', patient: 'Marco Antonio', date: '2024-03-21', amount: '$85', status: 'Pagado' },
    { id: '#INV-1026', patient: 'Sofía López', date: '2024-03-22', amount: '$200', status: 'Pendiente' },
    { id: '#INV-1027', patient: 'Ricardo Pérez', date: '2024-03-22', amount: '$85', status: 'Pagado' }
  ];

  chartData = {
    labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
    datasets: [{
      label: 'Ingresos',
      data: [8000, 9500, 12000, 11000, 13000, 15000],
      borderColor: '#22c55e',
      tension: 0.4,
      fill: true,
      backgroundColor: 'rgba(34, 197, 94, 0.1)'
    }]
  };
}
