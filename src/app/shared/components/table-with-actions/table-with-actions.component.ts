import { TitleCasePipe } from '@angular/common';
import {
  Component,
  HostListener,
  Input,
  OnInit,
  OnChanges,
  Output,
  EventEmitter,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatCardModule } from '@angular/material/card';
import { CommonModule } from '@angular/common';
import { ActionButtonComponent } from '../action-button/action-button.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { ActionButton } from '../list/types/action';
import { EventRemove, EventUpdate } from '../../events/load';
import { Column } from '../list/types/columns';

@Component({
  selector: 'app-table-with-actions',
  standalone: true,
  imports: [
    MatPaginatorModule,
    MatButtonModule,
    MatIconModule,
    TitleCasePipe,
    CommonModule,
    MatCardModule,
    ActionButtonComponent,
    MatProgressSpinnerModule,
    MatTableModule,
  ],
  templateUrl: './table-with-actions.component.html',
  styleUrls: ['./table-with-actions.component.css'],
})
export class TableWithActionsComponent<T extends object>
  implements OnInit, OnChanges
{
  @Output() updateCalled = new EventEmitter<EventUpdate>();
  @Output() removeCalled = new EventEmitter<EventRemove>();
  @Input() items: T[] = [];
  @Input() columns: Column<T>[] = [] as Column<T>[];
  @Input() isUpdateEnabled = false;
  @Input() isRemoveEnabled = false;
  @Input() updateActionButton: ActionButton = {
    type: 'update',
    label: 'Update',
  };
  @Input() removeActionButton: ActionButton = {
    type: 'remove',
    label: 'Remove',
  };
  dataSource: T[] = [];

  isMobile = false;
  totalItems = 0;
  actionColumns = [] as (keyof T)[];

  @HostListener('window:resize', ['$event'])
  onResize(event: UIEvent): void {
    const target = event.target as Window;
    this.isMobile = target.innerWidth < 768;
  }

  ngOnInit() {
    this.isMobile = window.innerWidth < 768;
    this.totalItems = this.items.length;

    if (this.isRemoveEnabled) {
      this.actionColumns.push('actionRemove' as keyof T);
    }
    if (this.isUpdateEnabled) {
      this.actionColumns.push('actionUpdate' as keyof T);
    }
    this.filterItems();
  }

  ngOnChanges() {
    this.filterItems();
  }

  filterItems() {
    if (!this.items || !this.columns) {
      console.error('Items or columns are not defined.');
      return;
    }

    const keys = this.columns.map(column => {
      return column.key;
    });

    this.dataSource = this.items.map(item => {
      const newItem = Object.keys(item)
        .filter(key => keys.includes(key as keyof T))
        .reduce((newItem: Partial<T>, key) => {
          newItem[key as keyof T] = item[key as keyof T];
          return newItem;
        }, {});

      return newItem;
    }) as unknown as T[];
    this.totalItems = this.items.length;
  }

  handleUpdate(event: EventUpdate) {
    this.updateCalled.emit(event);
  }

  handleRemove(event: EventRemove) {
    this.removeCalled.emit(event);
  }

  getColumnKeys() {
    return this.columns.map(column => {
      return column.key;
    });
  }
  getAllColumns() {
    return this.getColumnKeys().concat(this.actionColumns);
  }
}
