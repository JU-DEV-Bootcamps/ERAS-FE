import { Component, inject, OnInit } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { StudentModel } from '../../core/models/student.model';
import { StudentService } from '../../core/services/api/student.service';
import { EventLoad } from '../../shared/events/load';
import { NgClass } from '@angular/common';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog } from '@angular/material/dialog';
import { ModalStudentDetailComponent } from '../modal-student-detail/modal-student-detail.component';

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
    NgClass,
  ],
  templateUrl: './list-students-by-poll.component.html',
  styleUrl: './list-students-by-poll.component.scss',
})
export class ListStudentsByPollComponent implements OnInit {
  readonly dialog = inject(MatDialog);
  displayedColumns: string[] = ['id', 'name', 'email', 'isImported', 'action'];

  studentService = inject(StudentService);

  dataStudents = new MatTableDataSource<StudentModel>([]);
  students: StudentModel[] = [];
  pageSize = 10;
  currentPage = 0;
  totalStudents = 0;

  ngOnInit(): void {
    this.loadStudents();
  }

  loadStudents(): void {
    this.studentService
      .getData({
        page: this.currentPage,
        pageSize: this.pageSize,
      })
      .subscribe(data => {
        this.dataStudents = new MatTableDataSource(data.items);
        this.students = data.items;
        this.totalStudents = data.count;
      });
  }

  handleLoadCalled(event: EventLoad) {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadStudents();
  }

  onPageChange({
    pageSize,
    pageIndex,
  }: {
    pageIndex: number;
    pageSize: number;
  }): void {
    this.currentPage = pageIndex;
    this.pageSize = pageSize;
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
