import {
  Component,
  ContentChildren,
  ElementRef,
  EventEmitter,
  inject,
  Input,
  OnInit,
  Output,
  QueryList,
  TemplateRef,
  ViewChild,
  AfterContentInit,
} from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import {
  EventAction,
  EventLoad,
  EventRemove,
  EventUpdate,
} from '../../../core/models/load';

import { CsvService } from '@core/services/exports/csv.service';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { PdfHelper } from '@core/utils/reports/exportReport.util';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatMenuModule } from '@angular/material/menu';
import { FormsModule } from '@angular/forms';
import { EmptyDataComponent } from '../empty-data/empty-data.component';
import { defaultOptions, readOnlyColumns } from '../list/constants/list';
import { Column, ComponentColumn } from '../list/types/column';
import { ActionDatas } from '../list/types/action';
import { MapClass } from '../list/types/class';
import { TableWithActionsComponent } from '../table-with-actions-v2/table-with-actions-v2.component';

@Component({
  selector: 'app-list-details',
  imports: [
    FormsModule,
    MatProgressSpinnerModule,
    MatTableModule,
    MatPaginatorModule,
    MatCardModule,
    MatIconModule,
    MatSidenavModule,
    MatButtonModule,
    MatTooltipModule,
    MatMenuModule,
    EmptyDataComponent,
    TableWithActionsComponent,
  ],
  templateUrl: './list-details.component.html',
  styleUrl: './list-details.component.scss',
})
export class ListDetailsComponent<T extends object>
  implements OnInit, AfterContentInit
{
  csvService = inject(CsvService);
  pdfHelper = inject(PdfHelper);

  pageSize = defaultOptions.pageSize;
  currentPage = defaultOptions.currentPage;
  pageSizeOptions = defaultOptions.pageSizeOptions;

  isGenerating = false;

  @Input() items: T[] = [];
  @Input() totalItems = 0;
  @Input() data = new MatTableDataSource<T>([]);
  @Input() columns: Column<T>[] = [] as Column<T>[];
  @Input() exportColumns: Column<T>[] = [] as Column<T>[];
  @Input() componentColumns: ComponentColumn[] = [] as ComponentColumn[];
  @Input() actionDatas: ActionDatas = [];
  @Input() title?: string;
  @Input() mapClass?: MapClass;
  @Input() showExportDropdown = false;
  @Input() itemsAreSelectable = false;
  @Input() externalExport = false;

  @Output() loadCalled = new EventEmitter<EventLoad>();
  @Output() actionCalled = new EventEmitter<EventAction>();

  @ContentChildren(TemplateRef) templates!: QueryList<TemplateRef<unknown>>;
  @Input() columnTemplates: Column<T>[] = [];
  @ViewChild('contentToExport', { static: false }) contentToExport!: ElementRef;
  @Input() pageIndex = 0;

  templateMap = new Map<string, TemplateRef<unknown>>();

  selectedExportFormat: 'csv' | 'pdf' | '' = '';

  exportTable() {
    if (!this.selectedExportFormat) return;
    if (this.selectedExportFormat === 'csv') {
      this.exportToCSV();
    } else {
      this.exportToPdf();
    }
  }

  constructor(private snackBar: MatSnackBar) {}

  ngOnInit(): void {
    this.load();
  }

  ngAfterContentInit() {
    // Si usas #badgeTemplate, el nombre será 'badgeTemplate'
    this.templates.forEach((tpl: TemplateRef<unknown>) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const name = (tpl as any)._declarationTContainer?.localNames?.[0];
      if (name) {
        this.templateMap.set(name, tpl);
      }
    });
  }

  onPageChange(pagination: PageEvent): void {
    this.currentPage = pagination.pageIndex;
    this.pageSize = pagination.pageSize;
    this.load();
  }

  load(): void {
    this.loadCalled.emit({
      page: this.currentPage,
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
    if (this.isGenerating) return;
    this.isGenerating = true;
    const itemsToExport = this.itemsAreSelectable
      ? this.getItemsToExport()
      : this.items;
    const columnsToExport = [
      ...new Set([...this.columns, ...this.exportColumns]),
    ];
    const columnKeys = columnsToExport.map(c => c.key);
    const columnLabels = columnsToExport.map(c => c.label);

    this.csvService.exportToCSV(
      itemsToExport,
      columnKeys as string[],
      columnLabels
    );

    this.isGenerating = false;
  }

  async exportToPdf() {
    if (this.isGenerating) return;

    this.isGenerating = true;
    await this.pdfHelper.exportToPdf({
      fileName: 'report_detail',
      container: this.contentToExport,
      snackBar: this.snackBar,
      preProcess: 'list',
    });
    this.isGenerating = false;
  }

  private getItemsToExport(): T[] {
    const selectedItems = this.items.filter(
      item => 'isSelected' in item && item.isSelected
    );

    // No items selected so export them all
    if (selectedItems.length === 0) {
      return this.items;
    }

    return selectedItems;
  }
}
