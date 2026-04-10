import { Component, inject, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { EventAction, EventLoad } from '@core/models/load';
import { StudentModel } from '@core/models/student.model';
import { StudentService } from '@core/services/api/student.service';
import { Pagination } from '@core/services/interfaces/server.type';
import { ListComponent } from '@shared/components/list/list.component';
import { ActionDatas } from '@shared/components/list/types/action';
import { Column } from '@shared/components/list/types/column';
import { ModalStudentDetailComponent } from '@shared/components/modals/modal-student-detail/modal-student-detail.component';
import { SelectedCheckboxComponent } from './selected-checkbox/selected-checkbox.component';
import { ErasButtonComponent } from '@shared/components/buttons/eras-button/eras-button.component';
import { Router } from '@angular/router';
import { MatProgressSpinner } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-students-list',
  imports: [
    ErasButtonComponent,
    ListComponent,
    MatProgressSpinner,
    SelectedCheckboxComponent,
  ],
  templateUrl: './students-list.component.html',
  styleUrl: './students-list.component.scss',
})
export class StudentsListComponent implements OnInit {
  readonly dialog = inject(MatDialog);
  studentService = inject(StudentService);
  private router = inject(Router);

  dataStudents = new MatTableDataSource<StudentModel>([]);
  students: StudentModel[] = [];
  totalStudents = 0;
  pagination: Pagination = {
    pageSize: 10,
    page: 0,
  };
  isLoading = true;
  itemsAreSelectable = true;

  columns: Column<StudentModel>[] = [
    {
      key: 'name',
      label: 'Name',
    },
    {
      key: 'email',
      label: 'Email',
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
        this.dataStudents = new MatTableDataSource(data.items);
        const existingStudents = [...this.students];
        this.students = data.items.map(student => {
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

  openStudentDetails(student: StudentModel): void {
    this.dialog.open(ModalStudentDetailComponent, {
      width: 'clamp(520px, 50vw, 980px)',
      maxWidth: '90vw',
      maxHeight: '60vh',
      panelClass: 'border-modalbox-dialog',
      data: { studentId: student.id },
    });
  }

  exportList() {
    //TODO: Implement logic on next commit
    console.log('Clicking on exportList');
  }

  redirectToImport() {
    this.router.navigate(['import-students']);
  }
}
