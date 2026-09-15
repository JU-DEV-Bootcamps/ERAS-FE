import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ElementRef } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { provideAnimations } from '@angular/platform-browser/animations';
import { ActivatedRoute } from '@angular/router';

import { ListDetailsComponent } from './list-details.component';
import { CsvService } from '@core/services/exports/csv.service';
import { PdfHelper } from '@core/utils/reports/exportReport.util';
import { EventRemove, EventUpdate } from '../../../core/models/load';
import { defaultOptions, readOnlyColumns } from '../list/constants/list';
import { Column } from '../list/types/column';

interface TestItem {
  [key: string]: unknown;
  name: string;
  status: string;
  isSelected?: boolean;
}

describe('ListDetailsComponent', () => {
  let component: ListDetailsComponent<TestItem>;
  let fixture: ComponentFixture<ListDetailsComponent<TestItem>>;
  let csvServiceSpy: jasmine.SpyObj<CsvService>;
  let pdfHelperSpy: jasmine.SpyObj<PdfHelper>;

  const idKey = readOnlyColumns[0];

  const mockColumns: Column<TestItem>[] = [
    { key: 'name', label: 'Name' },
    { key: 'status', label: 'Status' },
  ];

  beforeEach(async () => {
    csvServiceSpy = jasmine.createSpyObj('CsvService', ['exportToCSV']);
    pdfHelperSpy = jasmine.createSpyObj('PdfHelper', ['exportToPdf']);
    pdfHelperSpy.exportToPdf.and.returnValue(Promise.resolve());

    await TestBed.configureTestingModule({
      imports: [ListDetailsComponent],
      providers: [
        provideAnimations(),
        { provide: ActivatedRoute, useValue: {} },
        { provide: CsvService, useValue: csvServiceSpy },
        { provide: PdfHelper, useValue: pdfHelperSpy },
        {
          provide: MatSnackBar,
          useValue: jasmine.createSpyObj('MatSnackBar', ['open']),
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ListDetailsComponent<TestItem>);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should call load() and emit loadCalled with the default page and pageSize', () => {
      const emitSpy = spyOn(component.loadCalled, 'emit');

      fixture.detectChanges();

      expect(emitSpy).toHaveBeenCalledWith({
        page: defaultOptions.currentPage,
        pageSize: defaultOptions.pageSize,
      });
    });
  });

  describe('onPageChange', () => {
    it('should update currentPage and pageSize and emit loadCalled', () => {
      const emitSpy = spyOn(component.loadCalled, 'emit');
      const pageEvent: PageEvent = { pageIndex: 2, pageSize: 25, length: 100 };

      component.onPageChange(pageEvent);

      expect(component.currentPage).toBe(2);
      expect(component.pageSize).toBe(25);
      expect(emitSpy).toHaveBeenCalledWith({ page: 2, pageSize: 25 });
    });
  });

  describe('handleAction', () => {
    it('should emit actionCalled with the given event', () => {
      const emitSpy = spyOn(component.actionCalled, 'emit');
      const event = { data: {}, event: new MouseEvent('click') } as never;

      component.handleAction(event);

      expect(emitSpy).toHaveBeenCalledWith(event);
    });
  });

  describe('removeRow', () => {
    it('should remove the closest tr ancestor of the event target from the DOM', () => {
      const container = document.createElement('div');
      const tr = document.createElement('tr');
      const button = document.createElement('button');
      tr.appendChild(button);
      container.appendChild(tr);

      const event = { event: { target: button } } as never as EventRemove;

      component.removeRow(event);

      expect(container.contains(tr)).toBeFalse();
    });
  });

  describe('getItemById', () => {
    it('should find the matching item using the readOnly id key', () => {
      const collection: TestItem[] = [
        { [idKey]: '1', name: 'John', status: 'Active' },
        { [idKey]: '2', name: 'Jane', status: 'Inactive' },
      ];

      const result = component.getItemById(
        { [idKey]: '2' } as TestItem,
        collection
      );

      expect(result).toBe(collection[1]);
    });

    it('should return null when the item has no readOnly id key', () => {
      const collection: TestItem[] = [
        { [idKey]: '1', name: 'John', status: 'Active' },
      ];

      const result = component.getItemById(
        { name: 'John', status: 'Active' } as TestItem,
        collection
      );

      expect(result).toBeNull();
    });

    it('should return undefined when no item in the collection matches the id', () => {
      const collection: TestItem[] = [
        { [idKey]: '1', name: 'John', status: 'Active' },
      ];

      const result = component.getItemById(
        { [idKey]: '999' } as TestItem,
        collection
      );

      expect(result).toBeUndefined();
    });
  });

  describe('updateRow', () => {
    beforeEach(() => {
      component.columns = mockColumns;
    });

    it('should update the non-readonly columns of the matching item', () => {
      const original: TestItem = {
        [idKey]: '1',
        name: 'John',
        status: 'Active',
      };
      component.items = [original];

      const event = { data: { [idKey]: '1' } } as never as EventUpdate;
      const dataEdited: TestItem = {
        [idKey]: '1',
        name: 'Johnny',
        status: 'Inactive',
      };

      component.updateRow(event, dataEdited);

      expect(component.items[0].name).toBe('Johnny');
      expect(component.items[0].status).toBe('Inactive');
    });

    it('should not modify items when no matching item is found', () => {
      const original: TestItem = {
        [idKey]: '1',
        name: 'John',
        status: 'Active',
      };
      component.items = [original];

      const event = { data: { [idKey]: '999' } } as never as EventUpdate;
      const dataEdited: TestItem = {
        [idKey]: '999',
        name: 'Ghost',
        status: 'Inactive',
      };

      component.updateRow(event, dataEdited);

      expect(component.items[0].name).toBe('John');
    });
  });

  describe('exportTable', () => {
    it('should call exportToCSV when typeExport is "csv"', () => {
      const csvSpy = spyOn(component, 'exportToCSV');
      const pdfSpy = spyOn(component, 'exportToPdf');

      component.exportTable('csv');

      expect(csvSpy).toHaveBeenCalled();
      expect(pdfSpy).not.toHaveBeenCalled();
    });

    it('should call exportToPdf when typeExport is not "csv"', () => {
      const csvSpy = spyOn(component, 'exportToCSV');
      const pdfSpy = spyOn(component, 'exportToPdf');

      component.exportTable('pdf');

      expect(pdfSpy).toHaveBeenCalled();
      expect(csvSpy).not.toHaveBeenCalled();
    });
  });

  describe('exportToCSV', () => {
    beforeEach(() => {
      component.columns = mockColumns;
    });

    it('should not export when already generating', () => {
      component.isGenerating = true;

      component.exportToCSV();

      expect(csvServiceSpy.exportToCSV).not.toHaveBeenCalled();
    });

    it('should reset isGenerating to false after exporting', () => {
      component.items = [{ name: 'John', status: 'Active' }];

      component.exportToCSV();

      expect(component.isGenerating).toBeFalse();
    });

    it('should export items directly when itemsAreSelectable is false', () => {
      const items: TestItem[] = [
        { name: 'John', status: 'Active' },
        { name: 'Jane', status: 'Inactive' },
      ];
      component.items = items;
      component.itemsAreSelectable = false;

      component.exportToCSV();

      expect(csvServiceSpy.exportToCSV).toHaveBeenCalledWith(
        items,
        ['name', 'status'],
        ['Name', 'Status']
      );
    });

    it('should export only the selected items when itemsAreSelectable is true and some are selected', () => {
      const items: TestItem[] = [
        { name: 'John', status: 'Active', isSelected: true },
        { name: 'Jane', status: 'Inactive', isSelected: false },
      ];
      component.items = items;
      component.itemsAreSelectable = true;

      component.exportToCSV();

      expect(csvServiceSpy.exportToCSV).toHaveBeenCalledWith(
        [items[0]],
        ['name', 'status'],
        ['Name', 'Status']
      );
    });

    it('should export all items when itemsAreSelectable is true but none are selected', () => {
      const items: TestItem[] = [
        { name: 'John', status: 'Active', isSelected: false },
        { name: 'Jane', status: 'Inactive', isSelected: false },
      ];
      component.items = items;
      component.itemsAreSelectable = true;

      component.exportToCSV();

      expect(csvServiceSpy.exportToCSV).toHaveBeenCalledWith(
        items,
        ['name', 'status'],
        ['Name', 'Status']
      );
    });

    it('should merge columns and exportColumns, deduplicating identical entries', () => {
      const sharedColumn: Column<TestItem> = { key: 'name', label: 'Name' };
      component.columns = [sharedColumn];
      component.exportColumns = [
        sharedColumn,
        { key: 'status', label: 'Status' },
      ];
      component.items = [{ name: 'John', status: 'Active' }];

      component.exportToCSV();

      expect(csvServiceSpy.exportToCSV).toHaveBeenCalledWith(
        jasmine.any(Array),
        ['name', 'status'],
        ['Name', 'Status']
      );
    });
  });

  describe('exportToPdf', () => {
    beforeEach(() => {
      component.contentToExport = {
        nativeElement: document.createElement('div'),
      } as ElementRef;
    });

    it('should not export when already generating', async () => {
      component.isGenerating = true;

      await component.exportToPdf();

      expect(pdfHelperSpy.exportToPdf).not.toHaveBeenCalled();
    });

    it('should call pdfHelper.exportToPdf with the expected config', async () => {
      await component.exportToPdf();

      expect(pdfHelperSpy.exportToPdf).toHaveBeenCalledWith(
        jasmine.objectContaining({
          fileName: 'report_detail',
          preProcess: 'list',
        })
      );
    });

    it('should set isGenerating to true during export and back to false afterward', async () => {
      let isGeneratingDuringExport = false;
      pdfHelperSpy.exportToPdf.and.callFake(async () => {
        isGeneratingDuringExport = component.isGenerating;
      });

      await component.exportToPdf();

      expect(isGeneratingDuringExport).toBeTrue();
      expect(component.isGenerating).toBeFalse();
    });

    it('should leave isGenerating stuck as true if exportToPdf rejects (missing try/finally)', async () => {
      pdfHelperSpy.exportToPdf.and.returnValue(Promise.reject('export failed'));

      await expectAsync(component.exportToPdf()).toBeRejected();

      expect(component.isGenerating).toBeTrue();
    });
  });
});
