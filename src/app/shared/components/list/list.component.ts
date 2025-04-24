import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { TableComponent } from '../table/table.component';
import { defaultOptions } from './constants/list';
import { EventLoad } from '../../events/load';

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
  @Output() loadCalled = new EventEmitter<EventLoad>();

  pageSize = defaultOptions.pageSize;
  currentPage = defaultOptions.currentPage;
  pageSizeOptions = defaultOptions.pageSizeOptions;
  @Input() items: T[] = [];
  @Input() data = new MatTableDataSource<T>([]);
  @Input() columns: (keyof T)[] = [];

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
    this.loadCalled.emit({
      pageIndex: this.currentPage,
      pageSize: this.pageSize,
    });
  }
}
