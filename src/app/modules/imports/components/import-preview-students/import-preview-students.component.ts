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

type PreviewDataRow = StudentModelPreview & {
  isSelected: boolean;
  _errors: string[];
  _hasError: boolean;
};

@Component({
  selector: 'app-import-preview-students',
  imports: [
    CommonModule,
    MatProgressSpinner,
    MatIconModule,
    ListComponent,
    MatTooltipModule,
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
  previewDataRows: PreviewDataRow[] = [];

  ngOnInit(): void {
    this.loadRows();
  }

  loadRows(): void {
    this.previewDataRows = this.rows.map(row => ({
      ...row.data,
      isSelected: row.errors.length === 0,
      _errors: row.errors,
      _hasError: row.errors.length > 0,
    }));
  }

  handleLoadCalled() {
    this.loadRows();
  }

  readonly isRowDisabled = (item: PreviewDataRow): boolean => item._hasError;

  get totalRows(): number {
    return this.previewDataRows.length;
  }

  get errorRowCount(): number {
    return this.previewDataRows.filter(r => r._hasError).length;
  }

  get selectedValidCount(): number {
    return this.previewDataRows.filter(r => r.isSelected && !r._hasError)
      .length;
  }

  get canConfirm(): boolean {
    return this.selectedValidCount > 0 && !this.isLoading;
  }

  get listColumns(): Column<StudentModelPreview>[] {
    return this.columns;
  }

  toggleAll(checked: boolean): void {
    this.previewDataRows.forEach(r => (r.isSelected = checked));
  }

  onConfirm(): void {
    if (!this.canConfirm) return;
    const selectedRows = this.previewDataRows
      .filter(r => r.isSelected && !r._hasError)
      .map(
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        ({ _errors, _hasError, isSelected, ...data }) =>
          data as StudentModelFlat
      );
    this.confirmed.emit({ rows: selectedRows });
  }

  onCancel(): void {
    this.cancelled.emit();
    this.dialogRef?.close();
  }
}
