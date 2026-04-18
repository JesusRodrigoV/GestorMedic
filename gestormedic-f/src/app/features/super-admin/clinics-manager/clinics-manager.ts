import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TableModule, TableLazyLoadEvent } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { RoundedButton } from '@shared/ui/rounded-button/rounded-button';
import { Clinic } from '@core/models/clinic.model';
import { DatePipe, UpperCasePipe } from '@angular/common';
import { ClinicsStore } from '../stores/clinics.stores';
import { SelectModule } from 'primeng/select';
import { ToggleSwitchModule } from 'primeng/toggleswitch';

@Component({
  selector: 'gm-clinics-manager',
  imports: [
    ReactiveFormsModule,
    TableModule,
    DialogModule,
    InputTextModule,
    SelectModule,
    ToggleSwitchModule,
    RoundedButton,
    DatePipe,
    UpperCasePipe,
  ],
  templateUrl: './clinics-manager.html',
  styleUrl: './clinics-manager.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [ClinicsStore],
})
export default class ClinicsManager {
  protected store = inject(ClinicsStore);
  private fb = inject(FormBuilder);

  protected dialogVisible = false;
  protected editingId: number | null = null;

  protected planOptions = [
    { label: 'Gratuito', value: 'free' },
    { label: 'Básico', value: 'basic' },
    { label: 'Profesional', value: 'pro' },
    { label: 'Empresarial', value: 'enterprise' },
  ];

  protected clinicForm = this.fb.nonNullable.group({
    name: ['', [Validators.required]],
    nit_ruc: ['', [Validators.required]],
    address: ['', [Validators.required]],
    phone: ['', [Validators.required]],
    logo_url: [''],
    plan: ['free', [Validators.required]],
    is_active: [true],
  });

  ngOnInit(): void {
    this.store.loadClinics({ page: 1, size: 10 });
  }

  protected onPageChange(event: TableLazyLoadEvent): void {
    const page = event.first !== undefined && event.rows ? event.first / event.rows + 1 : 1;
    const size = event.rows || 10;

    this.store.loadClinics({
      page: page,
      size: size,
      is_active: this.store.currentFilter(),
    });
  }

  protected filterByStatus(status: boolean | null): void {
    this.store.loadClinics({
      page: 1,
      size: this.store.pageSize(),
      is_active: status,
    });
  }

  protected openCreateDialog(): void {
    this.editingId = null;
    this.clinicForm.reset({ plan: 'free', is_active: true });
    this.dialogVisible = true;
  }

  protected openEditDialog(clinic: Clinic): void {
    this.editingId = clinic.id;
    this.clinicForm.patchValue({
      name: clinic.name,
      nit_ruc: clinic.nit_ruc,
      address: clinic.address,
      phone: clinic.phone,
      logo_url: clinic.logo_url,
      plan: clinic.plan,
      is_active: clinic.is_active,
    });
    this.dialogVisible = true;
  }

  protected closeDialog(): void {
    this.dialogVisible = false;
    this.clinicForm.reset();
    this.editingId = null;
  }

  protected onSave(): void {
    if (this.clinicForm.invalid) return;

    const payload = this.clinicForm.getRawValue();

    if (this.editingId) {
      this.store.updateClinic({ id: this.editingId, payload });
    } else {
      this.store.createClinic(payload);
    }

    this.closeDialog();
  }

  protected confirmDelete(id: number): void {
    if (
      confirm(
        'Atención: Eliminar una clínica es una acción destructiva que afectará a todos sus usuarios asociados. ¿Proceder?',
      )
    ) {
      this.store.deleteClinic(id);
    }
  }
}
