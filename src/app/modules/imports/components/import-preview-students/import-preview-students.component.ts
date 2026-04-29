import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import {
  PreviewRow,
  ImportPreviewConfirm,
  StudentModelPreview,
} from '@shared/components/list/types/preview';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { Column } from '@shared/components/list/types/column';
import { MatIconModule } from '@angular/material/icon';
import { ListComponent } from '@shared/components/list/list.component';
import { MandatoryColumns } from './import-preview-students.model';
import { StudentModelFlat } from '@core/models/student.model';
import { MatTooltipModule } from '@angular/material/tooltip';
import { SelectedCheckboxComponent } from '@modules/students/students-list/selected-checkbox/selected-checkbox.component';

@Component({
  selector: 'app-import-preview-students',
  imports: [
    CommonModule,
    MatProgressSpinner,
    MatIconModule,
    ListComponent,
    MatTooltipModule,
    SelectedCheckboxComponent,
  ],
  templateUrl: './import-preview-students.component.html',
  styleUrl: './import-preview-students.component.scss',
})
export class ImportPreviewStudentsComponent implements OnInit {
  @Input() title = 'Import Students';
  @Input() rows: PreviewRow[] = [];
  @Input() columns: Column<StudentModelPreview>[] = MandatoryColumns;
  columnTemplates: Column<StudentModelPreview>[] = [
    { key: 'error', label: 'Errors' },
  ];
  @Input() totalStudents = 0;
  @Input() itemsAreSelectable = true;
  @Input() isLoading = false;
  dialogRef?: MatDialogRef<ImportPreviewStudentsComponent>;

  @Output() confirmed = new EventEmitter<ImportPreviewConfirm>();
  @Output() cancelled = new EventEmitter<void>();

  statusColumn: Column<StudentModelPreview>[] = [{ key: 'status', label: '' }];
  previewRows: PreviewRow[] = [];
  previewDataRows: StudentModelPreview[] = [];

  ngOnInit(): void {
    this.loadRows();
  }

  loadRows(): void {
    this.previewRows = this.rows.map((row, i) => ({
      data: row.data,
      errors: row.errors,
      index: i,
      selected: row.errors.length === 0,
    }));
    this.previewDataRows = this.previewRows.map(row => ({
      ...row.data,
      isSelected: row.selected,
      _error: row.errors,
      _hasError: row.errors.length > 0,
    }));
    console.log('heree', this.previewDataRows);
  }

  handleLoadCalled() {
    this.loadRows();
  }

  get totalRows(): number {
    return this.previewRows.length;
  }

  get errorRowCount(): number {
    return this.previewRows.filter(r => r.errors.length > 0).length;
  }

  get selectedValidCount(): number {
    return this.previewRows.filter(r => r.selected && r.errors.length === 0)
      .length;
  }

  get canConfirm(): boolean {
    return this.selectedValidCount > 0 && !this.isLoading;
  }

  get listColumns(): Column<StudentModelPreview>[] {
    // return [...this.columns, ...this.statusColumn];
    return this.columns;
  }

  toggleAll(checked: boolean): void {
    this.previewRows.forEach(r => (r.selected = checked));
  }

  onConfirm(): void {
    if (!this.canConfirm) return;
    const selectedRows = this.previewRows
      .filter(r => r.selected && r.errors.length === 0)
      .map(r => r.data as StudentModelFlat);
    console.log('selectedRow', selectedRows);
    this.confirmed.emit({ rows: selectedRows });
  }

  onCancel(): void {
    this.cancelled.emit();
    this.dialogRef?.close();
  }
}
