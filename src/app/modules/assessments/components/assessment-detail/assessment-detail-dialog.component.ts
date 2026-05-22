import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { AssessmentStatusBadgeComponent } from '../assessment-list/assessment-status-badge/assessment-status-badge.component';
import { AssessmentRowViewModel } from '../assessment-list/assessment-list.component';
import { ListWithRemovalComponent } from '@modules/lists/components/list-with-removal/list-with-removal.component';
import { Column } from '@shared/components/list/types/column';
import { StudentProfileData } from '../assessment-list/assessment-student-data/assessment-student-data.component';
import { ActionDatas } from '@shared/components/list/types/action';

@Component({
  selector: 'app-assessment-detail-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatDividerModule,
    MatIconModule,
    AssessmentStatusBadgeComponent,
    ListWithRemovalComponent,
  ],
  templateUrl: './assessment-detail-dialog.component.html',
  styleUrl: './assessment-detail-dialog.component.scss',
})
export class AssessmentDetailDialogComponent {
  @Input({ required: true }) data!: AssessmentRowViewModel;

  @Output() close = new EventEmitter<void>();
  @Output() createIntervention = new EventEmitter<AssessmentRowViewModel>();

  columns: Column<StudentProfileData>[] = [
    { key: 'name', label: 'Name', showLabel: false },
    { key: 'email', label: 'Email', showLabel: false },
  ];

  actionDatas: ActionDatas = [
    {
      columnId: 'action_open',
      id: 'openStudentDetails',
      label: 'ActionOpen',
      ngIconName: 'open_in_new',
    },
    {
      columnId: 'action_close',
      id: 'removeStudent',
      label: 'ActionClose',
      ngIconName: 'close',
    },
  ];

  onClose(): void {
    this.close.emit();
  }

  onCreateIntervention(): void {
    this.createIntervention.emit(this.data);
  }
}
