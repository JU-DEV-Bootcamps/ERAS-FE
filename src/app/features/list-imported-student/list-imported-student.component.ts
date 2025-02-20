<<<<<<< HEAD
import { Component, HostListener, inject, OnInit } from '@angular/core';
=======
import { Component, inject, OnInit } from '@angular/core';
>>>>>>> 9c7a2ab (feat: add table with paginator for imported students)
import { ImportStudentService } from '../../core/services/import-students.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { TitleCasePipe } from '@angular/common';
import { MatPaginatorModule } from '@angular/material/paginator';
<<<<<<< HEAD
import { MatCardModule } from '@angular/material/card';
=======
>>>>>>> 9c7a2ab (feat: add table with paginator for imported students)

@Component({
  selector: 'app-list-imported-student',
  imports: [
    MatProgressSpinnerModule,
    MatTableModule,
    TitleCasePipe,
    MatPaginatorModule,
<<<<<<< HEAD
    MatCardModule,
  ],
  templateUrl: './list-imported-student.component.html',
  styleUrl: './list-imported-student.component.scss',
=======
  ],
  templateUrl: './list-imported-student.component.html',
  styleUrl: './list-imported-student.component.css',
>>>>>>> 9c7a2ab (feat: add table with paginator for imported students)
})
export class ListImportedStudentComponent implements OnInit {
  columns = ['id', 'name', 'uuid', 'email'];

  studentService = inject(ImportStudentService);

  data = new MatTableDataSource([]);
<<<<<<< HEAD
  students = [];
=======
>>>>>>> 9c7a2ab (feat: add table with paginator for imported students)

  pageSize = 10;
  currentPage = 0;
  totalStudents = 0;

<<<<<<< HEAD
  isMobile = false;

  ngOnInit(): void {
    this.loadStudents();
    this.checkScreenSize();
  }

  @HostListener('window:resize', [])
  checkScreenSize() {
    this.isMobile = window.innerWidth < 768;
=======
  ngOnInit(): void {
    this.loadStudents();
>>>>>>> 9c7a2ab (feat: add table with paginator for imported students)
  }

  loadStudents(): void {
    this.studentService
      .getData({
        page: this.currentPage,
        pageSize: this.pageSize,
      })
      .subscribe(data => {
<<<<<<< HEAD
        this.data = new MatTableDataSource(data.items);
        this.students = data.items;
=======
        this.data = data.items;
>>>>>>> 9c7a2ab (feat: add table with paginator for imported students)
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
