import { Component, inject, OnInit, viewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { EventAction, EventLoad } from '@core/models/load';
import { StudentModel, StudentModelFlat } from '@core/models/student.model';
import { StudentService } from '@core/services/api/student.service';
import { Pagination } from '@core/services/interfaces/server.type';
import { ListComponent } from '@shared/components/list/list.component';
import { ActionDatas } from '@shared/components/list/types/action';
import { Column } from '@shared/components/list/types/column';
import { ModalStudentDetailComponent } from '@shared/components/modals/modal-student-detail/modal-student-detail.component';
import { ErasButtonComponent } from '@shared/components/buttons/eras-button/eras-button.component';
import { Router } from '@angular/router';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatMenuModule } from '@angular/material/menu';
import { LastAccessPipe } from '@shared/pipes/last-access.pipe';
import { ModalStudentDetailV2Component } from '@shared/components/modals/modal-student-detail/v2/modal-student-detail-v2.component';
import { FeatureFlagsService } from '@core/components/feature-flags/feature-flags.service';
import { FEATURE_FLAGS } from '@core/components/feature-flags/feature-flags';
import { ComponentType } from '@angular/cdk/portal';

@Component({
  selector: 'app-students-list',
  imports: [
    ErasButtonComponent,
    ListComponent,
    MatProgressSpinner,
    MatMenuModule,
  ],
  templateUrl: './students-list.component.html',
  styleUrl: './students-list.component.scss',
})
export class StudentsListComponent implements OnInit {
  private readonly dialog = inject(MatDialog);
  private readonly router = inject(Router);
  private readonly studentService = inject(StudentService);
  private readonly lastAccessPipe = new LastAccessPipe();
  private readonly featureFlags = inject(FeatureFlagsService);

  private readonly list = viewChild(ListComponent);

  dataStudents = new MatTableDataSource<StudentModelFlat>([]);
  students: StudentModelFlat[] = [];
  totalStudents = 0;
  pagination: Pagination = {
    pageSize: 10,
    page: 0,
  };
  isLoading = true;
  itemsAreSelectable = true;
  isGenerating = false;

  columns: Column<StudentModelFlat>[] = [
    {
      key: 'name',
      label: 'Name',
    },
    {
      key: 'email',
      label: 'Email',
    },
    {
      key: 'timeDeliveryRate',
      label: 'Timely Submissions',
    },
    {
      key: 'avgScore',
      label: 'Avg. Score',
    },
    {
      key: 'lastAccessDays',
      label: 'Last Access',
      pipe: this.lastAccessPipe,
      pipeKey: 'lastAccessDays',
    },
  ];
  actionDatas: ActionDatas = [
    {
      columnId: 'actions',
      id: 'checkDetails',
      label: 'Actions',
      ngIconName: 'visibility',
      tooltip: 'See more details',
    },
  ];

  ngOnInit(): void {
    this.loadStudents();
  }

  loadStudents(): void {
    this.studentService.getData(this.pagination).subscribe({
      next: data => {
        const flatStudents = this.flattenStudentModel(data.items);
        this.dataStudents = new MatTableDataSource(flatStudents);
        const existingStudents = [...this.students];
        this.students = flatStudents.map(student => {
          const existingStudent = existingStudents.find(
            existingStudent => existingStudent.id === student.id
          );

          return {
            ...student,
            isSelected: existingStudent ? existingStudent.isSelected : false,
          };
        });
        this.totalStudents = data.count;
        this.isLoading = false;
      },
      error: err => {
        console.error(err);
        this.isLoading = false;
      },
      complete: () => {
        this.isLoading = false;
      },
    });
  }

  handleLoadCalled(event: EventLoad) {
    this.pagination = {
      page: event.page,
      pageSize: event.pageSize,
    };
    this.loadStudents();
  }

  handleActionCalled(event: EventAction): void {
    const studentItem = event.item as Partial<StudentModel>;
    const student = this.students.find(s => {
      return s.id === studentItem.id!;
    });

    if (student) {
      this.openStudentDetails(student);
    } else {
      console.warn('Student not found on array.');
    }
  }

  onPageChange(pagination: PageEvent): void {
    this.pagination = {
      page: pagination.pageIndex,
      pageSize: pagination.pageSize,
    };
    this.loadStudents();
  }

  openStudentDetails(student: StudentModelFlat): void {
    const showV2 = this.featureFlags.isEnabled(FEATURE_FLAGS.studentDetails);
    const component: ComponentType<object> = showV2
      ? ModalStudentDetailV2Component
      : ModalStudentDetailComponent;
    this.dialog.open(component, {
      width: '1152px',
      maxWidth: '95vw',
      maxHeight: '921.59px',
      panelClass: 'border-modalbox-dialog',
      data: { studentId: student.id },
    });
  }

  exportToCSV() {
    if (this.isGenerating) return;

    this.isGenerating = true;
    this.list()?.exportToCSV();
    this.isGenerating = false;
  }

  async exportToPdf() {
    if (this.isGenerating) return;

    this.isGenerating = true;
    this.list()?.exportToPdf();
    this.isGenerating = false;
  }

  redirectToImport() {
    this.router.navigate(['import-students']);
  }

  private flattenStudentModel(data: StudentModel[]): StudentModelFlat[] {
    return data.map(student => ({
      uuid: student.uuid,
      name: student.name,
      email: student.email,
      isImported: student.isImported,
      cohortId: student.cohortId,
      cohort: student.cohort,
      studentId: student.studentDetail.studentId,
      enrolledCourses: student.studentDetail.enrolledCourses,
      gradedCourses: student.studentDetail.gradedCourses,
      timeDeliveryRate: student.studentDetail.timeDeliveryRate,
      avgScore: student.studentDetail.avgScore,
      coursesUnderAvg: student.studentDetail.coursesUnderAvg,
      pureScoreDiff: student.studentDetail.pureScoreDiff,
      standardScoreDiff: student.studentDetail.standardScoreDiff,
      lastAccessDays: student.studentDetail.lastAccessDays,
      isSelected: student.isSelected,
      audit: student.audit,
      id: student.id,
    }));
  }
}
