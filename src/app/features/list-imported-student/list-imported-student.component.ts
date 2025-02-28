import { Component, inject, OnInit } from '@angular/core';
import { ImportStudentService } from '../../core/services/import-students.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatCardModule } from '@angular/material/card';
import { TableComponent } from '../../shared/components/table/table.component';

@Component({
  selector: 'app-list-imported-student',
  imports: [
    MatProgressSpinnerModule,
    MatTableModule,
    MatPaginatorModule,
    MatCardModule,
    TableComponent,
  ],
  templateUrl: './list-imported-student.component.html',
  styleUrl: './list-imported-student.component.scss',
})
export class ListImportedStudentComponent implements OnInit {
  columns = ['id', 'name', 'uuid', 'email'];

  studentService = inject(ImportStudentService);

  data = new MatTableDataSource([]);
  students = [];

  pageSize = 10;
  currentPage = 0;
  totalStudents = 0;

  isMobile = false;

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
        this.data = new MatTableDataSource(data.items);
        this.students = data.items;
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
