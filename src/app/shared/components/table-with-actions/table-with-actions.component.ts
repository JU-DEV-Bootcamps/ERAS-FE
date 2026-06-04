import { CommonModule } from '@angular/common';
import {
  Component,
  HostListener,
  Input,
  OnInit,
  Output,
  EventEmitter,
  TemplateRef,
  CUSTOM_ELEMENTS_SCHEMA,
  input,
  WritableSignal,
  signal,
  OnChanges,
  SimpleChanges,
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
import { MatCheckboxModule } from '@angular/material/checkbox';
import { SelectedCheckboxComponent } from '@modules/students/students-list/selected-checkbox/selected-checkbox.component';
import { OverflowTooltipDirective } from '@shared/directives/overflow-tooltip.directive';

@Component({
  selector: 'app-table-with-actions',
  standalone: true,
  imports: [
    MatPaginatorModule,
    MatButtonModule,
    MatIconModule,
    CommonModule,
    MatCardModule,
    ActionButtonComponent,
    MatProgressSpinnerModule,
    MatTableModule,
    MatTooltip,
    MatMenu,
    MatMenuTrigger,
    MatMenuModule,
    MatCheckboxModule,
    SelectedCheckboxComponent,
    OverflowTooltipDirective,
  ],
  templateUrl: './table-with-actions.component.html',
  styleUrls: ['./table-with-actions.component.scss'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class TableWithActionsComponent<T extends object>
  implements OnInit, OnChanges
{
  @Input() items: T[] = [];
  @Input() columns: Column<T>[] = [] as Column<T>[];
  @Input() templateMap: Map<string, TemplateRef<unknown>> = new Map<
    string,
    TemplateRef<unknown>
  >();
  @Input() columnTemplates: Column<T>[] = [];
  actionDatas = input.required<ActionDatas>();
  @Input() mapClass?: MapClass;
  @Input() itemsAreSelectable = false;
  @Input() columnOrder: Column<T>[] = [];
  @Input() isItemDisabled?: (item: T) => boolean;

  @Output() actionCalled = new EventEmitter<EventAction>();

  isMobile = false;
  totalItems = 0;
  actionColumns = ['Actions'];
  displayedColumns: string[] = [];
  allItemsSelected: WritableSignal<boolean> = signal<boolean>(false);
  displayCache = new Map<T, Record<string, string>>();

  @HostListener('window:resize', ['$event'])
  onResize(event: UIEvent): void {
    const target = event.target as Window;
    this.isMobile = target.innerWidth < 768;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['items']) {
      this.buildDisplayCache();
      Promise.resolve().then(() => {
        this.allItemsSelected.set(this.areAllItemsSelected());
      });
    }
  }

  ngOnInit() {
    this.isMobile = window.innerWidth < 768;
    this.totalItems = this.items.length;
    this.displayedColumns = this.getAllColumns();
  }

  handleAction(event: EventAction) {
    this.actionCalled.emit(event);
  }

  getColumnKeys() {
    return this.columns.map(column => {
      return column.key.toString();
    });
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
    return this.actionDatas().some(
      (actionData: ActionData) => 'text' in actionData
    );
  }

  getAllColumns(): string[] {
    const base = this.columnOrder.length
      ? this.columnOrder.map(c => c.key.toString())
      : [
          ...this.columns.map(c => c.key.toString()),
          ...this.columnTemplates.map(c => c.key.toString()),
        ];

    const result = [];
    if (this.itemsAreSelectable) result.push('isSelected');
    result.push(...base);
    if (this.actionDatas().length > 0) result.push('Actions');
    return result;
  }

  private areAllItemsSelected(): boolean {
    const selectableItems = this.isItemDisabled
      ? this.items.filter(item => !this.isItemDisabled!(item))
      : this.items;
    return (
      selectableItems.length > 0 &&
      selectableItems.every(item => 'isSelected' in item && item.isSelected)
    );
  }

  private toggleItemsSelection(selected: boolean) {
    this.items.forEach(item => {
      if ('isSelected' in item) {
        if (selected && this.isItemDisabled?.(item)) return;
        item.isSelected = selected;
      }
    });
    this.allItemsSelected.set(this.areAllItemsSelected());
  }

  itemChecked() {
    if (this.isItemDisabled) {
      this.items.forEach(item => {
        if (this.isItemDisabled!(item) && 'isSelected' in item) {
          item.isSelected = false;
        }
      });
    }
    this.allItemsSelected.set(this.areAllItemsSelected());
  }

  handleSelectAll() {
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    this.allItemsSelected()
      ? this.toggleItemsSelection(false)
      : this.toggleItemsSelection(true);
  }

  private buildDisplayCache(): void {
    this.displayCache.clear();
    for (const item of this.items ?? []) {
      const row: Record<string, string> = {};
      for (const col of this.columns ?? []) {
        row[col.key.toString()] = this.showElement(item, col);
      }
      this.displayCache.set(item, row);
    }
  }
}
