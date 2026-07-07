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
import { ModalDeleteConfirmationService } from '@shared/components/modals/modal-delete-confirmation/modal-delete-confirmation.service';
import { AssessmentService } from '@core/services/api/assessement.service';
import { ToastNotificationService } from '@core/services/toast-notification.service';
import { AssessmentModel } from '@core/models/assessment.model';
import { ToastNotificationData } from '@core/models/toast-notification.model';
import { HttpErrorResponse } from '@angular/common/http';

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
  @Output() closeRefresh = new EventEmitter<void>();

  private readonly dialog = inject(MatDialog);
  private readonly featureFlags = inject(FeatureFlagsService);
  private readonly modalDeleteService = inject(ModalDeleteConfirmationService);
  private readonly assessmentService = inject(AssessmentService);
  private readonly toastService = inject(ToastNotificationService);

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

  onCloseRefresh(): void {
    this.closeRefresh.emit();
  }

  onCreateIntervention(): void {
    this.createIntervention.emit(this.data);
  }

  onActionCalled(event: EventUpdate) {
    const item = event.item as StudentProfileData;
    if (event.data.id === 'openStudentDetails') {
      this.openStudentDetails(item.id);
    } else if (event.data.id === 'removeStudent') {
      this.onDeleteStudent(item.id);
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

  onDeleteStudent(studentId: number): void {
    if (this.data.students?.length === 1) {
      const toastData = this.buildPreventiveToastDataObject();
      this.toastService.showToast(toastData);
      return;
    }
    const studentsWithoutRemoved = this.data.students?.filter(
      st => st.id !== studentId
    );
    const studentsIdWithoutRemoved = this.data.studentIds.filter(
      st => parseInt(st) !== studentId
    );

    const dataToUpdate = {
      ...this.data,
      studentIds: studentsIdWithoutRemoved,
      students: studentsWithoutRemoved,
    };
    if (this.data.id === undefined) {
      return;
    }
    this.modalDeleteService
      .confirmDelete({
        title: `Delete student from assessment`,
      })
      .afterClosed()
      .subscribe(confirmed => {
        if (!confirmed) return;
        const id = this.data.id as number;
        this.assessmentService
          .editAssessment(id.toString(), dataToUpdate)
          .subscribe({
            next: () => {
              const toastData = this.buildSuccessToastDataObject(this.data);
              this.toastService.showToast(toastData);
              this.assessmentService.clearCache();
              this.onCloseRefresh();
            },
            error: error => {
              const toastData = this.buildErrorToastDataObject(
                this.data,
                error
              );
              this.toastService.showToast(toastData, true);
              console.error('Failed to remove one assessment', error);
            },
          });
      });
  }

  private buildSuccessToastDataObject(
    item: AssessmentModel
  ): ToastNotificationData {
    return {
      title: 'Student removed successfully',
      message: `Assessment with id: ${item.id} has removed a student`,
      type: 'success',
    };
  }

  private buildErrorToastDataObject(
    item: AssessmentModel,
    error: HttpErrorResponse
  ): ToastNotificationData {
    return {
      title: 'Student removed failed',
      message: `Assessment with id: ${item.id} has not removed anything, ${error.error.message}`,
      type: 'error',
    };
  }

  private buildPreventiveToastDataObject(): ToastNotificationData {
    return {
      title: 'Action not allowed',
      message:
        'The current student cannot be removed because this assessment must have at least one student.',
      type: 'error',
    };
  }
}
