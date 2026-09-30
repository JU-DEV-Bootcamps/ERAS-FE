import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ElementRef } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { provideAnimations } from '@angular/platform-browser/animations';
import { ActivatedRoute } from '@angular/router';

import { ListComponent } from './list.component';
import { CsvService } from '@core/services/exports/csv.service';
import { PdfHelper } from '@core/utils/reports/exportReport.util';
import { EventRemove, EventUpdate } from '../../../core/models/load';
import { defaultOptions, readOnlyColumns } from './constants/list';
import { Column } from './types/column';

interface TestItem {
  [key: string]: unknown;
  name: string;
  status: string;
  isSelected?: boolean;
}

describe('ListComponent', () => {
  let component: ListComponent<TestItem>;
  let fixture: ComponentFixture<ListComponent<TestItem>>;
  let csvServiceSpy: jasmine.SpyObj<CsvService>;
  let pdfHelperSpy: jasmine.SpyObj<PdfHelper>;

  // Se usa el primer key real de readOnlyColumns en vez de asumir un
  // nombre literal ('id', 'uuid', etc.), para no volver a romper por
  // una suposición equivocada sobre el contenido de la constante.
  const idKey = readOnlyColumns[0];

  const mockColumns: Column<TestItem>[] = [
    { key: 'name', label: 'Name' },
    { key: 'status', label: 'Status' },
  ];

  beforeEach(async () => {
    csvServiceSpy = jasmine.createSpyObj('CsvService', ['exportToCSV']);
    pdfHelperSpy = jasmine.createSpyObj('PdfHelper', [
      'exportToPdf',
      'exportToPdfChunked',
      'printReportInfo',
    ]);
    pdfHelperSpy.exportToPdf.and.returnValue(Promise.resolve());

    await TestBed.configureTestingModule({
      imports: [ListComponent],
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

    fixture = TestBed.createComponent(ListComponent<TestItem>);
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
    it('should do nothing when no export format is selected', () => {
      const csvSpy = spyOn(component, 'exportToCSV');
      const pdfSpy = spyOn(component, 'exportToPdf');
      component.selectedExportFormat = '';

      component.exportTable();

      expect(csvSpy).not.toHaveBeenCalled();
      expect(pdfSpy).not.toHaveBeenCalled();
    });

    it('should call exportToCSV when format is csv', () => {
      const csvSpy = spyOn(component, 'exportToCSV');
      component.selectedExportFormat = 'csv';

      component.exportTable();

      expect(csvSpy).toHaveBeenCalled();
    });

    it('should call exportToPdf when format is not csv', () => {
      const pdfSpy = spyOn(component, 'exportToPdf');
      component.selectedExportFormat = 'pdf';

      component.exportTable();

      expect(pdfSpy).toHaveBeenCalled();
    });
  });

  describe('exportToCSV', () => {
    const items: TestItem[] = [
      { name: 'John', status: 'Active' },
      { name: 'Jane', status: 'Inactive' },
    ];

    beforeEach(() => {
      component.columns = mockColumns;
    });

    it('should not export when already generating', () => {
      component.isGenerating = true;

      component.exportToCSV();

      expect(csvServiceSpy.exportToCSV).not.toHaveBeenCalled();
    });

    it('should export the selected items when itemsAreSelectable is true and some are selected', () => {
      const selectable: TestItem[] = [
        { name: 'John', status: 'Active', isSelected: true },
        { name: 'Jane', status: 'Inactive', isSelected: false },
      ];
      component.items = selectable;
      component.itemsAreSelectable = true;

      component.exportToCSV();

      expect(csvServiceSpy.exportToCSV).toHaveBeenCalledWith(
        [selectable[0]],
        ['name', 'status'],
        ['Name', 'Status']
      );
    });

    it('should export all items when itemsAreSelectable is true but none are selected', () => {
      const selectable: TestItem[] = [
        { name: 'John', status: 'Active', isSelected: false },
        { name: 'Jane', status: 'Inactive', isSelected: false },
      ];
      component.items = selectable;
      component.itemsAreSelectable = true;

      component.exportToCSV();

      expect(csvServiceSpy.exportToCSV).toHaveBeenCalledWith(
        selectable,
        ['name', 'status'],
        ['Name', 'Status']
      );
    });

    it('should export allItems when itemsAreSelectable is false and allItems is populated', () => {
      component.items = items;
      component.allItems = items;
      component.itemsAreSelectable = false;

      component.exportToCSV();

      expect(csvServiceSpy.exportToCSV).toHaveBeenCalledWith(
        items,
        ['name', 'status'],
        ['Name', 'Status']
      );
    });

    it('should export an empty array when itemsAreSelectable is false and allItems was never populated', () => {
      component.items = items;
      component.itemsAreSelectable = false;

      component.exportToCSV();

      expect(csvServiceSpy.exportToCSV).toHaveBeenCalledWith(
        [],
        ['name', 'status'],
        ['Name', 'Status']
      );
    });

    it('should emit exportRequested and wait for allItems before exporting when areExportedAllItems is true', async () => {
      const exportRequestedSpy = spyOn(component.exportRequested, 'emit');
      component.areExportedAllItems = true;

      component.exportToCSV();

      expect(exportRequestedSpy).toHaveBeenCalledWith('csv');
      expect(csvServiceSpy.exportToCSV).not.toHaveBeenCalled();

      component.allItems = items;
      component.ngOnChanges({
        allItems: {
          currentValue: items,
          previousValue: [],
          firstChange: false,
          isFirstChange: () => false,
        },
      });

      // Deja correr el microtask del `.then()` pendiente en exportToCSV
      await Promise.resolve();

      expect(csvServiceSpy.exportToCSV).toHaveBeenCalledWith(
        items,
        ['name', 'status'],
        ['Name', 'Status']
      );
    });
  });

  describe('exportToPdf', () => {
    beforeEach(() => {
      component.columns = mockColumns;
      component.contentToExport = {
        nativeElement: document.createElement('div'),
      } as ElementRef;
    });

    it('should not export when already generating', async () => {
      const exportingSpy = spyOn(component.exporting, 'emit');
      component.isGenerating = true;

      await component.exportToPdf();

      expect(pdfHelperSpy.exportToPdf).not.toHaveBeenCalled();
      expect(exportingSpy).not.toHaveBeenCalled();
    });

    it('should export using items when allItems was never populated', async () => {
      const items: TestItem[] = [{ name: 'John', status: 'Active' }];
      component.items = items;
      component.areExportedAllItems = false;

      await component.exportToPdf();

      expect(pdfHelperSpy.exportToPdf).toHaveBeenCalledWith(
        jasmine.objectContaining({
          fileName: 'report_detail',
          preProcess: 'list',
        })
      );
      expect(component.items).toEqual(items);
    });

    it('should temporarily swap in allItems for the export and restore items afterward', async () => {
      const displayedItems: TestItem[] = [{ name: 'John', status: 'Active' }];
      const fullItems: TestItem[] = [
        { name: 'John', status: 'Active' },
        { name: 'Jane', status: 'Inactive' },
      ];
      component.items = displayedItems;
      component.allItems = fullItems;
      component.areExportedAllItems = false;
      const exportingSpy = spyOn(component.exporting, 'emit');

      let itemsDuringExport: TestItem[] = [];
      pdfHelperSpy.exportToPdf.and.callFake(async () => {
        itemsDuringExport = component.items;
      });

      await component.exportToPdf();

      expect(itemsDuringExport).toEqual(fullItems);
      expect(component.items).toEqual(displayedItems);
      expect(component.showPaginator).toBeTrue();
      expect(component.isGenerating).toBeFalse();
      expect(exportingSpy).toHaveBeenCalledWith(true);
      expect(exportingSpy).toHaveBeenCalledWith(false);
    });

    it('should wait for allItems before exporting when areExportedAllItems is true', async () => {
      component.items = [];
      component.areExportedAllItems = true;
      const exportRequestedSpy = spyOn(component.exportRequested, 'emit');

      const exportPromise = component.exportToPdf();

      // El executor de la Promise interna corre sync hasta el primer await,
      // así que esto ya debería estar seteado antes de resolver nada.
      expect(exportRequestedSpy).toHaveBeenCalledWith('pdf');
      expect(pdfHelperSpy.exportToPdf).not.toHaveBeenCalled();

      const items: TestItem[] = [{ name: 'John', status: 'Active' }];
      component.allItems = items;
      component.ngOnChanges({
        allItems: {
          currentValue: items,
          previousValue: [],
          firstChange: false,
          isFirstChange: () => false,
        },
      });

      await exportPromise;

      expect(pdfHelperSpy.exportToPdf).toHaveBeenCalled();
      expect(component.isGenerating).toBeFalse();
    });
  });

  describe('exportToPdf when allItems is already loaded', () => {
    beforeEach(() => {
      component.columns = mockColumns;
      component.contentToExport = {
        nativeElement: document.createElement('div'),
      } as ElementRef;
    });

    it('should not wait for ngOnChanges on a second export', async () => {
      component.allItems = [{ name: 'John', status: 'Active' }];
      component.areExportedAllItems = true;
      const exportRequestedSpy = spyOn(component.exportRequested, 'emit');

      await component.exportToPdf();
      await component.exportToPdf();

      expect(exportRequestedSpy).toHaveBeenCalledTimes(2);
      expect(pdfHelperSpy.exportToPdf).toHaveBeenCalledTimes(2);
      expect(component.isGenerating).toBeFalse();
    });

    it('should export CSV immediately when allItems is already loaded', async () => {
      component.allItems = [{ name: 'John', status: 'Active' }];
      component.areExportedAllItems = true;

      component.exportToCSV();
      await Promise.resolve();

      expect(csvServiceSpy.exportToCSV).toHaveBeenCalled();
    });
  });

  describe('exportToPdf wait timeout', () => {
    beforeEach(() => jasmine.clock().install());
    afterEach(() => jasmine.clock().uninstall());

    it('should stop waiting when the parent never provides allItems', async () => {
      component.areExportedAllItems = true;
      const exportSpy = spyOn(
        component as unknown as { getItemsToExport: () => TestItem[] },
        'getItemsToExport'
      ).and.throwError('stop');
      spyOn(console, 'error');

      const promise = component.exportToPdf();
      jasmine.clock().tick(30000);
      await promise;

      expect(exportSpy).toHaveBeenCalled();
      expect(component['pendingExportResolve']).toBeNull();
      expect(component.isGenerating).toBeFalse();
    });
  });

  describe('ngOnChanges', () => {
    it('should resolve pendingExportResolve when allItems changes and has items', () => {
      const resolveSpy = jasmine.createSpy('resolve');
      component['pendingExportResolve'] = resolveSpy;
      component.allItems = [{ name: 'a', status: 'b' }];

      component.ngOnChanges({
        allItems: {
          currentValue: component.allItems,
          previousValue: [],
          firstChange: false,
          isFirstChange: () => false,
        },
      });

      expect(resolveSpy).toHaveBeenCalled();
      expect(component['pendingExportResolve']).toBeNull();
    });

    it('should not resolve when allItems changes but is empty', () => {
      const resolveSpy = jasmine.createSpy('resolve');
      component['pendingExportResolve'] = resolveSpy;
      component.allItems = [];

      component.ngOnChanges({
        allItems: {
          currentValue: [],
          previousValue: [],
          firstChange: false,
          isFirstChange: () => false,
        },
      });

      expect(resolveSpy).not.toHaveBeenCalled();
    });

    it('should not throw when allItems changes but there is no pending resolve', () => {
      component.allItems = [{ name: 'a', status: 'b' }];

      expect(() => {
        component.ngOnChanges({
          allItems: {
            currentValue: component.allItems,
            previousValue: [],
            firstChange: false,
            isFirstChange: () => false,
          },
        });
      }).not.toThrow();
    });
  });
  describe('ngAfterContentInit', () => {
    it('should register templates by their local name', () => {
      const namedTpl = {
        _declarationTContainer: { localNames: ['badgeTemplate'] },
      };
      const unnamedTpl = {};
      component.templates = [
        namedTpl,
        unnamedTpl,
      ] as unknown as typeof component.templates;

      component.ngAfterContentInit();

      expect(component.templateMap.get('badgeTemplate')).toBe(
        namedTpl as never
      );
      expect(component.templateMap.size).toBe(1);
    });
  });

  describe('exportToPdf (selection, chunks and errors)', () => {
    beforeEach(() => {
      component.columns = mockColumns;
      component.contentToExport = {
        nativeElement: document.createElement('div'),
      } as ElementRef;
    });

    it('should export only the selected items', async () => {
      const selected: TestItem = {
        name: 'John',
        status: 'Active',
        isSelected: true,
      };
      component.items = [selected, { name: 'Jane', status: 'Inactive' }];
      let itemsDuringExport: TestItem[] = [];
      pdfHelperSpy.exportToPdf.and.callFake(async () => {
        itemsDuringExport = component.items;
      });

      await component.exportToPdf();

      expect(itemsDuringExport).toEqual([selected]);
    });

    it('should use the chunked export for more than 100 items and restore items', async () => {
      const displayed: TestItem[] = [{ name: 'John', status: 'Active' }];
      const all: TestItem[] = Array.from({ length: 101 }, (_, i) => ({
        name: `n${i}`,
        status: 's',
      }));
      component.items = displayed;
      component.allItems = all;
      const chunkEl = document.createElement('div');
      pdfHelperSpy.printReportInfo.and.returnValue(chunkEl);

      const chunkSizes: number[] = [];
      let returnedEl: HTMLElement | undefined;
      pdfHelperSpy.exportToPdfChunked.and.callFake(async args => {
        for (let i = 0; i < args.totalChunks; i++) {
          returnedEl = await args.getChunkElement(i, args.totalChunks);
          chunkSizes.push(component.items.length);
          await args.onChunkDone?.(i, args.totalChunks);
        }
      });

      await component.exportToPdf();

      expect(pdfHelperSpy.exportToPdfChunked).toHaveBeenCalledWith(
        jasmine.objectContaining({
          fileName: 'report_detail',
          preProcess: 'list',
        })
      );
      expect(returnedEl).toBe(chunkEl);
      expect(chunkSizes.reduce((a, b) => a + b, 0)).toBe(101);
      expect(component.items).toEqual(displayed);
      expect(component.data.data).toEqual(displayed);
    });

    it('should log the error and notify via snackbar when the export fails', async () => {
      const consoleErrorSpy = spyOn(console, 'error');
      const snackBar = TestBed.inject(
        MatSnackBar
      ) as jasmine.SpyObj<MatSnackBar>;
      component.items = [{ name: 'John', status: 'Active' }];
      pdfHelperSpy.exportToPdf.and.returnValue(Promise.reject(new Error('x')));

      await component.exportToPdf();

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'PDF export error:',
        jasmine.any(Error)
      );
      expect(snackBar.open).toHaveBeenCalledWith(
        'Error exporting PDF. Please try again.',
        'Close',
        jasmine.objectContaining({ panelClass: 'snackbar-error' })
      );
      expect(component.isGenerating).toBeFalse();
    });
  });
});
