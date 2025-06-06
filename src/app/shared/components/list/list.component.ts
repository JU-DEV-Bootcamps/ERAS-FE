import {
  Component,
  EventEmitter,
  inject,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { defaultOptions, readOnlyColumns } from './constants/list';
import {
  EventAction,
  EventLoad,
  EventRemove,
  EventUpdate,
} from '../../events/load';
import { TableWithActionsComponent } from '../table-with-actions/table-with-actions.component';
import { Column } from './types/column';
import { ActionDatas } from './types/action';
import { CsvService } from '../../../core/services/exports/csv.service';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-list',
  imports: [
    MatProgressSpinnerModule,
    MatTableModule,
    MatPaginatorModule,
    MatCardModule,
    TableWithActionsComponent,
    MatIconModule,
    MatSidenavModule,
    MatButtonModule,
    MatTooltipModule,
  ],
  templateUrl: './list.component.html',
  styleUrl: './list.component.css',
})
export class ListComponent<T extends object> implements OnInit {
  csvService = inject(CsvService);

  pageSize = defaultOptions.pageSize;
  currentPage = defaultOptions.currentPage;
  pageSizeOptions = defaultOptions.pageSizeOptions;

  @Input() items: T[] = [];
  @Input() totalItems = 0;
  @Input() data = new MatTableDataSource<T>([]);
  @Input() columns: Column<T>[] = [] as Column<T>[];
  @Input() actionDatas: ActionDatas = [];
  @Input() title?: string;

  @Output() loadCalled = new EventEmitter<EventLoad>();
  @Output() actionCalled = new EventEmitter<EventAction>();

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

  handleAction(event: EventUpdate) {
    this.actionCalled.emit(event);
  }

  removeRow(event: EventRemove) {
    const target = event.event.target as HTMLButtonElement;
    const domRow = target.closest('tr')!;

    domRow.remove();
  }

  updateRow(event: EventUpdate, dataEdited: T) {
    const newItems = [...this.items];
    const data = event.data as T;
    const columnsToUpdate = this.columns
      .map(column => {
        return column.key;
      })
      .filter(key => {
        return !readOnlyColumns.includes(key.toString());
      });
    const itemToUpdate = this.getItemById(data, newItems);

    if (itemToUpdate) {
      columnsToUpdate.forEach(column => {
        itemToUpdate[column] = dataEdited[column];
      });
      this.items = newItems;
    }
  }

  getItemById(item: T, collection: T[]) {
    const keys = Object.keys(item);

    let idKey: keyof T | null = null;

    keys.forEach(key => {
      if (readOnlyColumns.includes(key)) {
        idKey = key as keyof T;
      }
    });

    if (idKey === null) {
      return null;
    }

    const itemWithId = collection.find(it => {
      return it[idKey as keyof T] === item[idKey as keyof T];
    });

    return itemWithId;
  }

  exportToCSV() {
    const columnKeys = this.columns.map(c => c.key);
    const columnLabels = this.columns.map(c => c.label);

    this.csvService.exportToCSV(
      this.items,
      columnKeys as string[],
      columnLabels
    );
  }
}
