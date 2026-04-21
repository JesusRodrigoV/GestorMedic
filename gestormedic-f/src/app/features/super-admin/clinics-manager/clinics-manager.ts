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
import { MainContainer } from '@core/layouts/main-container';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';

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
    MainContainer,
    ConfirmDialogModule,
  ],
  templateUrl: './clinics-manager.html',
  styleUrl: './clinics-manager.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [ClinicsStore, ConfirmationService],
})
export default class ClinicsManager {
  protected store = inject(ClinicsStore);
  private fb = inject(FormBuilder);
  private confirmationService = inject(ConfirmationService);

  protected dialogVisible = false;
  protected editingId: number | null = null;

  protected planOptions = [
    { label: 'Gratuita', value: 'free' },
    { label: 'Básica', value: 'basic' },
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

    this.clinicForm.get('name')?.enable();
    this.clinicForm.get('nit_ruc')?.enable();
    this.clinicForm.get('address')?.enable();
    this.clinicForm.get('phone')?.enable();

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

    this.clinicForm.get('name')?.disable();
    this.clinicForm.get('nit_ruc')?.disable();
    this.clinicForm.get('address')?.disable();
    this.clinicForm.get('phone')?.disable();

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
    this.confirmationService.confirm({
      message:
        'Eliminar una clínica borrará de forma permanente a todos sus usuarios asociados. ¿Desea proceder?',
      header: 'Confirmar Eliminación',
      icon: 'bx bx-error-circle',
      acceptLabel: 'Eliminar',
      rejectLabel: 'Cancelar',
      accept: () => {
        this.store.deleteClinic(id);
      },
    });
  }
}
