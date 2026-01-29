import { CommonModule, TitleCasePipe } from '@angular/common';
import {
  Component,
  HostListener,
  Input,
  OnInit,
  Output,
  EventEmitter,
  TemplateRef,
  CUSTOM_ELEMENTS_SCHEMA,
} from '@angular/core';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatMenu, MatMenuModule, MatMenuTrigger } from '@angular/material/menu';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { MatTooltip } from '@angular/material/tooltip';

import {
  ActionData,
  ActionDatas,
  ActionDataWithCondition,
} from '../list/types/action';
import { EventAction } from '../../../core/models/load';
import { Column } from '../list/types/column';
import { MapClass } from '../list/types/class';

import { ActionButtonComponent } from '../buttons/action-button/action-button.component';

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
    MatTooltip,
    MatMenu,
    MatMenuTrigger,
    MatMenuModule,
  ],
  templateUrl: './table-with-actions.component.html',
  styleUrls: ['./table-with-actions.component.scss'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class TableWithActionsComponent<T extends object> implements OnInit {
  @Input() items: T[] = [];
  @Input() columns: Column<T>[] = [] as Column<T>[];
  @Input() templateMap: Map<string, TemplateRef<unknown>> = new Map<
    string,
    TemplateRef<unknown>
  >();
  @Input() columnTemplates: Column<T>[] = [];
  @Input() actionDatas: ActionDatas = [];
  @Input() mapClass?: MapClass;

  @Output() actionCalled = new EventEmitter<EventAction>();

  dataSource: T[] = [];

  isMobile = false;
  totalItems = 0;
  actionColumns = ['Actions'] as (keyof T)[];

  @HostListener('window:resize', ['$event'])
  onResize(event: UIEvent): void {
    const target = event.target as Window;
    this.isMobile = target.innerWidth < 768;
  }

  ngOnInit() {
    this.isMobile = window.innerWidth < 768;
    this.totalItems = this.items.length;
  }

  handleAction(event: EventAction) {
    this.actionCalled.emit(event);
  }

  getColumnKeys() {
    return this.columns.map(column => {
      return column.key;
    });
  }
  getAllColumns() {
    let columnKeys = this.getColumnKeys();

    if (this.getTotalTemplateColumns() > 0) {
      columnKeys = columnKeys.concat(this.columnTemplates.map(ct => ct.key));
    }

    if (this.getTotalActionDatas() > 0) {
      columnKeys = columnKeys.concat(this.actionColumns);
    }

    return columnKeys;
  }

  getActionDatas() {
    return this.actionDatas;
  }

  getTotalActionDatas() {
    return this.getActionDatas().length;
  }

  getTotalTemplateColumns() {
    return this.columnTemplates.length;
  }

  showElement(element: T, column: Column<T>) {
    const rawData = element;

    if (column.pipe) {
      if (column.pipeArgs) {
        return column.pipe.transform(
          column.pipeKey ? rawData[column.pipeKey] : rawData,
          ...column.pipeArgs
        );
      }
      return column.pipe.transform(
        column.pipeKey ? rawData[column.pipeKey] : rawData
      );
    } else {
      return rawData[column.key];
    }
  }

  getTemplateForColumn(key: string): TemplateRef<unknown> | null {
    return this.templateMap.get(key) || null;
  }

  isVisible(actionData: ActionData | ActionDataWithCondition<T>, item: T) {
    const actionDataWC = actionData as ActionDataWithCondition<T>;
    const isValidWithCondition =
      !actionDataWC.isVisible || actionDataWC.isVisible(item);

    return isValidWithCondition;
  }

  hasTextAttribute() {
    return this.actionDatas.some(
      (actionData: ActionData) => 'text' in actionData
    );
  }
}
