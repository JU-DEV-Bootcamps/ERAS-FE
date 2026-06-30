import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
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
import { ModalStudentDetailV2Component } from '@shared/components/modals/modal-student-detail/v2/modal-student-detail-v2.component';
import { ModalStudentDetailComponent } from '@shared/components/modals/modal-student-detail/modal-student-detail.component';
import { FEATURE_FLAGS } from '@core/components/feature-flags/feature-flags';
import { ComponentType } from '@angular/cdk/overlay';
import { FeatureFlagsService } from '@core/components/feature-flags/feature-flags.service';
import { MatDialog } from '@angular/material/dialog';
import { EventUpdate } from '@core/models/load';

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

  private readonly dialog = inject(MatDialog);
  private readonly featureFlags = inject(FeatureFlagsService);

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

  onActionCalled(event: EventUpdate) {
    const item = event.item as StudentProfileData;
    if (event.data.id === 'openStudentDetails') {
      this.openStudentDetails(item.id ?? 0);
    } else if (event.data.id === 'removeStudent') {
      console.log('reomve student');
    }
  }

  openStudentDetails(studentId: number): void {
    const showV2 = this.featureFlags.isEnabled(FEATURE_FLAGS.studentDetails);
    const component: ComponentType<object> = showV2
      ? ModalStudentDetailV2Component
      : ModalStudentDetailComponent;
    this.dialog.open(component, {
      width: '1152px',
      maxWidth: '95vw',
      maxHeight: '921.59px',
      panelClass: 'border-modalbox-dialog',
      data: { studentId },
    });
  }
}
