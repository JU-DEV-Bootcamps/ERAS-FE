import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import {
  PreviewRow,
  ImportPreviewConfirm,
  StudentModelPreview,
} from '@shared/components/list/types/preview';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { Column } from '@shared/components/list/types/column';
import { Pagination } from '@core/services/interfaces/server.type';
import { MatIconModule } from '@angular/material/icon';
import { ListComponent } from '@shared/components/list/list.component';
import { EventLoad } from '@core/models/load';

@Component({
  selector: 'app-import-preview-students',
  imports: [CommonModule, MatProgressSpinner, MatIconModule, ListComponent],
  templateUrl: './import-preview-students.component.html',
  styleUrl: './import-preview-students.component.scss',
})
export class ImportPreviewStudentsComponent {
  @Input() title = 'Import Students';
  @Input() rows: PreviewRow[] = [];
  @Input() columns: Column<StudentModelPreview>[] = [
    { key: 'studentId', label: 'Id' },
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'uuid', label: 'SIS Id' },
    // { key: 'enrolledCourses', label: 'Enrolled' },
    // { key: 'gradedCourses', label: 'Graded' },
    // { key: 'timeDeliveryRate', label: 'Timely sub.' },
    // { key: 'avgScore', label: 'Avg. score' },
    // { key: 'coursesUnderAvg', label: 'Below avg.' },
    // { key: 'pureScoreDiff', label: 'Raw diff.' },
    // { key: 'standardScoreDiff', label: 'Std. diff.' },
    // { key: 'lastAccessDays', label: 'Days since access' },
  ];
  columnTemplates: Column<StudentModelPreview>[] = [
    { key: 'error', label: 'Errors' },
  ];
  @Input() totalStudents = 0;
  @Input() itemsAreSelectable = true;
  @Input() isGenerating = false;
  @Input() isLoading = false;
  dialogRef?: MatDialogRef<ImportPreviewStudentsComponent>;

  @Output() confirmed = new EventEmitter<ImportPreviewConfirm>();
  @Output() cancelled = new EventEmitter<void>();

  pagination: Pagination = {
    pageSize: 10,
    page: 0,
  };
  previewRows: PreviewRow[] = [];
  previewDataRows: StudentModelPreview[] = [];

  loadRows(): void {
    this.previewRows = this.rows.map((row, i) => ({
      data: row.data,
      errors: row.errors,
      index: i,
      selected: true,
    }));
    console.log('import preview', this.previewRows);
    this.previewDataRows = this.rows.map(row => row.data);
    this.previewDataRows = this.previewDataRows.map((row, index) => ({
      ...row,
      isSelected: true,
      error: this.previewRows[index].errors[0],
    }));
    console.log('hiii previewDataRows', this.previewDataRows);
  }

  handleLoadCalled(event: EventLoad) {
    console.log('heere', event);
    this.pagination = {
      page: event.page,
      pageSize: event.pageSize,
    };
    this.loadRows();
  }

  get totalRows(): number {
    return this.previewRows.length;
  }

  get errorRows(): PreviewRow[] {
    return this.previewRows.filter(r => r.errors.length > 0);
  }

  get errorRowCount(): number {
    return this.errorRows.length;
  }

  get selectedCount(): number {
    return this.previewRows.filter(r => r.selected).length;
  }

  get selectedValidCount(): number {
    return this.previewRows.filter(r => r.selected && r.errors.length === 0)
      .length;
  }

  get allSelected(): boolean {
    return (
      this.previewRows.length > 0 && this.previewRows.every(r => r.selected)
    );
  }

  get someSelected(): boolean {
    return this.previewRows.some(r => r.selected) && !this.allSelected;
  }

  get canConfirm(): boolean {
    return this.selectedValidCount > 0 && !this.isLoading;
  }

  toggleAll(checked: boolean): void {
    this.previewRows.forEach(r => (r.selected = checked));
  }

  toggleRow(row: PreviewRow, checked: boolean): void {
    row.selected = checked;
  }

  onConfirm(): void {
    if (!this.canConfirm) return;
    const selectedRows = this.previewRows
      .filter(r => r.selected && r.errors.length === 0)
      .map(r => r.data);
    console.log('selectedRow', selectedRows);
    // this.confirmed.emit({ rows: selectedRows });
  }

  onCancel(): void {
    this.cancelled.emit();
    this.dialogRef?.close();
  }

  trackByIndex(_: number, row: PreviewRow): number {
    return row.index ?? 0;
  }

  cellValue(row: PreviewRow, key: string): string {
    const val = row.data;
    console.log(key);
    if (val === null || val === undefined) return '—';
    return String(val);
  }
}
