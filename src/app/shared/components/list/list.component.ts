import { Component, Input, OnInit, Output } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { TableComponent } from '../table/table.component';
import { defaultOptions } from './constants/list';
import { EventEmitter } from 'stream';

@Component({
  selector: 'app-list',
  imports: [
    MatProgressSpinnerModule,
    MatTableModule,
    MatPaginatorModule,
    MatCardModule,
    TableComponent,
  ],
  templateUrl: './list.component.html',
  styleUrl: './list.component.css',
})
export class ListComponent<T extends object> implements OnInit {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  @Output() callLoad = new EventEmitter<any>();

  pageSize = defaultOptions.pageSize;
  currentPage = defaultOptions.currentPage;
  pageSizeOptions = defaultOptions.pageSizeOptions;
  items: T[] = [];
  totalItems = 0;
  data = new MatTableDataSource<T>([]);
  @Input() columns: (keyof T)[] = [];
  //columns: (keyof T)[] = ['id', 'name', 'uuid', 'email'];

  ngOnInit(): void {
    this.load();
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
    this.load();
  }

  load(): void {
    this.callLoad.emit([
      {
        page: this.currentPage,
        pageSize: this.pageSize,
      },
    ]);
    /* this.studentService
      .getData({
        page: this.currentPage,
        pageSize: this.pageSize,
      })
      .subscribe(data => {
        this.data = new MatTableDataSource<Student>(data.items);
        this.students = data.items;
        this.totalItems = data.count;
      }); */
  }
}
