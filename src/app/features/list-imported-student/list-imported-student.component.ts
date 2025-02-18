import { Component, inject, OnInit } from '@angular/core';
import { ImportStudentService } from '../../core/services/import-students.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { TitleCasePipe } from '@angular/common';
import { MatPaginatorModule } from '@angular/material/paginator';

@Component({
  selector: 'app-list-imported-student',
  imports: [
    MatProgressSpinnerModule,
    MatTableModule,
    TitleCasePipe,
    MatPaginatorModule,
  ],
  templateUrl: './list-imported-student.component.html',
  styleUrl: './list-imported-student.component.css',
})
export class ListImportedStudentComponent implements OnInit {
  columns = ['id', 'name', 'uuid', 'email'];

  studentService = inject(ImportStudentService);

  data = new MatTableDataSource([]);

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
        this.data = data.items;
        this.totalStudents = data.count;
      });
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
}
