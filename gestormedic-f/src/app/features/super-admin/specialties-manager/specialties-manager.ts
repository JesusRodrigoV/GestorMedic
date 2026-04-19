import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { TableModule, TableLazyLoadEvent } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { RoundedButton } from '@shared/ui/rounded-button/rounded-button';
import { Specialty } from '@core/models/specialty.model';
import { SpecialtiesStore } from '../stores/specialties.store';

@Component({
  selector: 'gm-specialties-manager',
  imports: [
    ReactiveFormsModule,
    TableModule,
    DialogModule,
    InputTextModule,
    TextareaModule,
    RoundedButton,
  ],
  templateUrl: './specialties-manager.html',
  styleUrl: './specialties-manager.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [SpecialtiesStore],
})
export default class SpecialtiesManager {
protected store = inject(SpecialtiesStore);
  private fb = inject(FormBuilder);

  protected searchControl = new FormControl('');
  protected dialogVisible = false;
  protected editingId: number | null = null;

  protected specialtyForm = this.fb.nonNullable.group({
    name: ['', [Validators.required]],
    description: ['', [Validators.required]]
  });

  ngOnInit(): void {
    this.searchControl.valueChanges.pipe(
      debounceTime(400),
      distinctUntilChanged()
    ).subscribe((query) => {
      this.store.loadSpecialties({
        page: 1,
        size: this.store.pageSize(),
        search: query || ''
      });
    });
  }

  protected onPageChange(event: TableLazyLoadEvent): void {
    const page = event.first !== undefined && event.rows ? (event.first / event.rows) + 1 : 1;
    const size = event.rows || 10;
    
    this.store.loadSpecialties({
      page: page,
      size: size,
      search: this.store.currentSearch()
    });
  }

  protected openCreateDialog(): void {
    this.editingId = null;
    this.specialtyForm.reset();
    this.dialogVisible = true;
  }

  protected openEditDialog(specialty: Specialty): void {
    this.editingId = specialty.id;
    this.specialtyForm.patchValue({
      name: specialty.name,
      description: specialty.description
    });
    this.dialogVisible = true;
  }

  protected closeDialog(): void {
    this.dialogVisible = false;
    this.specialtyForm.reset();
    this.editingId = null;
  }

  protected onSave(): void {
    if (this.specialtyForm.invalid) return;

    const payload = this.specialtyForm.getRawValue();

    if (this.editingId) {
      this.store.updateSpecialty({ id: this.editingId, payload });
    } else {
      this.store.createSpecialty(payload);
    }

    this.closeDialog();
  }

  protected confirmDelete(id: number): void {
    if (confirm('¿Está seguro de que desea eliminar este registro crítico del sistema?')) {
      this.store.deleteSpecialty(id);
    }
  }
}
