import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { defaultOptions } from './constants/list';
import { EventLoad, EventRemove, EventUpdate } from '../../events/load';
import { TableWithActionsComponent } from '../table-with-actions/table-with-actions.component';

@Component({
  selector: 'app-list',
  imports: [
    MatProgressSpinnerModule,
    MatTableModule,
    MatPaginatorModule,
    MatCardModule,
    TableWithActionsComponent,
  ],
  templateUrl: './list.component.html',
  styleUrl: './list.component.css',
})
export class ListComponent<T extends object> implements OnInit {
  pageSize = defaultOptions.pageSize;
  currentPage = defaultOptions.currentPage;
  pageSizeOptions = defaultOptions.pageSizeOptions;
  @Input() items: T[] = [];
  @Input() data = new MatTableDataSource<T>([]);
  @Input() columns = [] as (keyof T)[];
  @Output() loadCalled = new EventEmitter<EventLoad>();
  @Output() updateCalled = new EventEmitter<EventUpdate>();
  @Output() removeCalled = new EventEmitter<EventRemove>();

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

  handleUpdate(event: EventUpdate) {
    this.updateCalled.emit(event);
  }

  handleRemove(event: EventRemove) {
    this.removeCalled.emit(event);
  }
}
