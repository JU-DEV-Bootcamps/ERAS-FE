import { Component, HostListener, inject, OnInit } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatCardModule } from '@angular/material/card';
import { PollInstanceService } from '../../core/services/poll-instance.service';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { NgFor } from '@angular/common';
import { MatSelectChange } from '@angular/material/select';
import { TimestampToDatePipe } from '../../shared/pipes/timestamp-to-date.pipe';

@Component({
  selector: 'app-list-imported-student',
  imports: [
    MatProgressSpinnerModule,
    MatTableModule,
    MatPaginatorModule,
    MatCardModule,
    FormsModule,
    MatInputModule,
    MatSelectModule,
    NgFor,
    ReactiveFormsModule,
    TimestampToDatePipe,
  ],
  templateUrl: './list-poll-instances-by-lastdays.component.html',
  styleUrl: './list-poll-instances-by-lastdays.component.scss',
})
export class ListPollInstancesByLastDaysComponent implements OnInit {
  dropDays = ['1', '5', '10', '20', '30'];
  daysControl = new FormControl(this.dropDays[0]);

  columns = ['uuid', 'finishedAt', 'name', 'email', 'createdAt', 'modifiedAt'];
  columnsText = [
    'Uuid',
    'Finished At',
    'Student Name',
    'Student Email',
    'Created At',
    'Modified At',
  ];

  pollInstanceService = inject(PollInstanceService);
  loading = true;
  data = new MatTableDataSource([]);
  pollInstances = [];

  pageSize = 10;
  currentPage = 0;
  totalPollInstances = 0;

  isMobile = false;

  ngOnInit(): void {
    this.loadPollInstances(this.dropDays[3]);
    this.checkScreenSize();
  }

  @HostListener('window:resize', [])
  checkScreenSize() {
    this.isMobile = window.innerWidth < 768;
    console.log(this.isMobile);
  }

  loadPollInstances(days: string): void {
    this.pollInstanceService
      .getPollInstancesByLastDays(parseInt(days))
      .subscribe(data => {
        this.loading = true;
        this.data = new MatTableDataSource(data.body);
        this.pollInstances = data.items;
        this.totalPollInstances = data.count;
        this.loading = false;
      });
  }

  onSelectionChange(event: MatSelectChange) {
    this.loadPollInstances(event.value);
  }
}
