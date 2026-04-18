import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { TableModule, TableLazyLoadEvent } from 'primeng/table';
import { InputNumberModule } from 'primeng/inputnumber';
import { DatePipe, JsonPipe } from '@angular/common';
import { RoundedButton } from '@shared/ui/rounded-button/rounded-button';
import { AuditStore } from '../stores/audit.store';
import { SelectModule } from 'primeng/select';

@Component({
  selector: 'gm-audit-manager',
imports: [
    ReactiveFormsModule,
    TableModule,
    SelectModule, 
    InputNumberModule,
    RoundedButton,
    DatePipe,
    JsonPipe
  ],
  templateUrl: './audit-manager.html',
  styleUrl: './audit-manager.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [AuditStore]
})
export default class AuditManager {
protected store = inject(AuditStore);
  private fb = inject(FormBuilder);

  protected eventOptions = [
    { label: 'Todos', value: null },
    { label: 'Inicio de sesión', value: 'login' },
    { label: 'Registro de usuario', value: 'register' },
    { label: 'Actualización de datos', value: 'update' },
    { label: 'Eliminación', value: 'delete' },
    { label: 'Cambio de clave', value: 'password_reset' }
  ];

  protected filterForm = this.fb.nonNullable.group({
    clinic_id: [null as number | null],
    event_type: [null as string | null]
  });

  ngOnInit(): void {
    this.store.loadLogs({ page: 1, size: 10 });
  }

  protected onPageChange(event: TableLazyLoadEvent): void {
    const page = event.first !== undefined && event.rows ? (event.first / event.rows) + 1 : 1;
    const size = event.rows || 10;
    
    this.store.loadLogs({
      page: page,
      size: size,
      clinic_id: this.store.currentClinicFilter(),
      event_type: this.store.currentEventFilter()
    });
  }

  protected applyFilters(): void {
    const filters = this.filterForm.getRawValue();
    this.store.loadLogs({
      page: 1,
      size: this.store.pageSize(),
      clinic_id: filters.clinic_id,
      event_type: filters.event_type
    });
  }

  protected clearFilters(): void {
    this.filterForm.reset({ clinic_id: null, event_type: null });
    this.store.loadLogs({
      page: 1,
      size: this.store.pageSize(),
      clinic_id: null,
      event_type: null
    });
  }
}
