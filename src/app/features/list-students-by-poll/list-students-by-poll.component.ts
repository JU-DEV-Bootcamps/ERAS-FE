import { Component, inject, OnInit } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { StudentModel } from '../../core/models/student.model';
import { StudentService } from '../../core/services/api/student.service';
import { EventAction, EventLoad } from '../../shared/events/load';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog } from '@angular/material/dialog';
import { ModalStudentDetailComponent } from '../modal-student-detail/modal-student-detail.component';
import { Pagination } from '../../core/services/interfaces/server.type';
import { ListComponent } from '../../shared/components/list/list.component';
import { Column } from '../../shared/components/list/types/column';
import { ActionDatas } from '../../shared/components/list/types/action';
import { BadgeImportedComponent } from './badge-imported/badge-imported.component';

@Component({
  selector: 'app-list-students-by-poll',
  standalone: true,
  imports: [
    MatProgressSpinnerModule,
    MatTableModule,
    MatPaginatorModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    MatTooltipModule,
    ListComponent,
    BadgeImportedComponent,
  ],
  templateUrl: './list-students-by-poll.component.html',
  styleUrl: './list-students-by-poll.component.scss',
})
export class ListStudentsByPollComponent implements OnInit {
  readonly dialog = inject(MatDialog);
  studentService = inject(StudentService);

  dataStudents = new MatTableDataSource<StudentModel>([]);
  students: StudentModel[] = [];
  totalStudents = 0;
  pagination: Pagination = {
    page: 0,
    pageSize: 10,
  };
  columns: Column<StudentModel>[] = [
    {
      key: 'id',
      label: '#',
    },
    {
      key: 'name',
      label: 'Name',
    },
    {
      key: 'email',
      label: 'Email',
    },
  ];
  columnTemplates: Column<StudentModel>[] = [
    {
      key: 'isImported',
      label: 'Is imported?',
    },
  ];
  actionDatas: ActionDatas = [
    {
      columnId: 'actions',
      label: 'Actions',
      ngIconName: 'analytics',
      tooltip: 'See more details',
    },
  ];

  ngOnInit(): void {
    this.loadStudents();
  }

  loadStudents(): void {
    this.studentService.getData(this.pagination).subscribe(data => {
      this.dataStudents = new MatTableDataSource(data.items);
      this.students = data.items;
      this.totalStudents = data.count;
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
      minHeight: '500px',
      maxHeight: '60vh',
      panelClass: 'border-modalbox-dialog',
      data: { studentId: student.id },
    });
  }
}
