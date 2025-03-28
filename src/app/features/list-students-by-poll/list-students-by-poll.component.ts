import { Component, inject, OnInit } from '@angular/core';
import { ImportStudentService } from '../../core/services/import-students.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { NgFor } from '@angular/common';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatCardModule } from '@angular/material/card';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { PollService } from '../../core/services/poll.service';
import { TableComponent } from '../../shared/components/table/table.component';
import { Poll } from './types/list-students-by-poll';

@Component({
  selector: 'app-list-students-by-poll',
  standalone: true,
  imports: [
    MatProgressSpinnerModule,
    MatTableModule,
    MatPaginatorModule,
    MatCardModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    NgFor,
    TableComponent,
  ],
  templateUrl: './list-students-by-poll.component.html',
  styleUrl: './list-students-by-poll.component.scss',
})
export class ListStudentsByPollComponent implements OnInit {
  columns = ['id', 'name', 'uuid', 'email'];
  pollsData: Poll[] = [];
  selectedPoll = this.pollsData[0];
  periods = [5, 15, 30, 60, 90, 180, 360, 0];
  defaultPerioid = this.periods[0];

  studentService = inject(ImportStudentService);
  pollService = inject(PollService);

  dataStudents = new MatTableDataSource([]);
  students = [];
  pageSize = 10;
  currentPage = 0;
  totalStudents = 0;

  pollFormGroup = new FormGroup({
    period: new FormControl(this.defaultPerioid),
    pollUuid: new FormControl(''),
  });

  ngOnInit(): void {
    this.loadPollsList();
    this.pollFormGroup.valueChanges.subscribe(formValue => {
      this.defaultPerioid = formValue.period!;
      this.selectedPoll = this.pollsData.filter(
        poll => poll.uuid == formValue.pollUuid
      )[0];
      this.loadStudents();
    });
  }

  loadPollsList(): void {
    this.pollService.getAllPolls().subscribe(data => {
      this.pollsData = data;
      this.selectedPoll = data[0];
      this.pollFormGroup.get('pollUuid')?.setValue(data[0].uuid);
      this.loadStudents();
    });
  }

  loadStudents(): void {
    this.studentService
      .getDataStudentsByPoll({
        days: this.defaultPerioid,
        pollUuid: this.selectedPoll.uuid,
        page: this.currentPage,
        pageSize: this.pageSize,
      })
      .subscribe(data => {
        this.dataStudents = new MatTableDataSource(data.items);
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
