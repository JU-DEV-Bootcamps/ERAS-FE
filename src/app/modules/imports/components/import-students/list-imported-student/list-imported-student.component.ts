import { Component, inject } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatCardModule } from '@angular/material/card';
import { StudentModel } from '@core/models/student.model';
import { StudentService } from '@core/services/api/student.service';
import { ListComponent } from '@shared/components/list/list.component';
import { Column } from '@shared/components/list/types/column';
import { EventLoad } from '@core/models/load';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-list-imported-student',
  imports: [
    MatProgressSpinnerModule,
    MatTableModule,
    MatPaginatorModule,
    MatCardModule,
    ListComponent,
  ],
  templateUrl: './list-imported-student.component.html',
  styleUrl: './list-imported-student.component.scss',
})
export class ListImportedStudentComponent {
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

  studentService = inject(StudentService);
  students: StudentModel[] = [];

  pageSize = 10;
  currentPage = 0;
  totalStudents = 0;

  isMobile = false;
  isLoading = false;

  handleLoad(event: EventLoad) {
    this.currentPage = event.page;
    this.pageSize = event.pageSize;
    this.loadStudents();
  }

  loadStudents(): void {
    this.isLoading = true;
    this.studentService
      .getData({
        page: this.currentPage,
        pageSize: this.pageSize,
      })
      .pipe(
        finalize(() => {
          this.isLoading = false;
        })
      )
      .subscribe(data => {
        this.students = data.items;
        this.totalStudents = data.count;
      });
  }
}
