import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TitleCasePipe } from '@angular/common';
import { By } from '@angular/platform-browser';
import { PipeTransform, TemplateRef } from '@angular/core';

import { PollName } from '@core/models/poll-request.model';
import { Column } from '../list/types/column';
import { ActionDatas, ActionDataWithCondition } from '../list/types/action';
import { EventAction } from '../../../core/models/load';
import { MatCardDetailsComponent } from './mat-card-details.component';

describe('MatCardDetailsComponent', () => {
  let component: MatCardDetailsComponent<PollName>;
  let fixture: ComponentFixture<MatCardDetailsComponent<PollName>>;

  const mockItems: PollName[] = [
    {
      parent: 'parent',
      name: 'John Doe',
      status: 'Active',
      selectData: 'data',
      country: 'algeria',
    },
    {
      parent: 'other parent',
      name: 'Jane Smith',
      status: 'Inactive',
      selectData: 'mockData',
      country: 'argentina',
    },
  ];

  const mockColumns: Column<PollName>[] = [
    { key: 'parent', label: 'Parent' },
    { key: 'name', label: 'Name' },
    { key: 'status', label: 'Status' },
  ];

  const mockActionDatas: ActionDatas = [
    {
      columnId: 'actions',
      ngIconName: 'edit',
      label: 'Edit',
      id: 'id1',
    },
    {
      columnId: 'actions',
      ngIconName: 'delete',
      label: 'Delete',
      id: 'id2',
    },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        MatCardDetailsComponent,
        MatTableModule,
        MatPaginatorModule,
        MatButtonModule,
        MatIconModule,
        MatCardModule,
        MatProgressSpinnerModule,
      ],
      providers: [TitleCasePipe],
    }).compileComponents();

    fixture = TestBed.createComponent(MatCardDetailsComponent<PollName>);
    component = fixture.componentInstance;

    component.items = mockItems;
    component.columns = mockColumns;
    fixture.componentRef.setInput('actionDatas', mockActionDatas);

    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should render action buttons in the Actions column', () => {
    const rowInfos = fixture.debugElement.queryAll(By.css('.row-info'));
    const actionButtons = fixture.debugElement.queryAll(
      By.css('app-action-button')
    );

    expect(rowInfos.length).toBe(mockItems.length * mockColumns.length);
    expect(actionButtons.length).toBe(
      mockItems.length * mockActionDatas.length
    );
  });

  it('should render cards instead of a table when in mobile view', () => {
    fixture.detectChanges();

    const cards = fixture.debugElement.queryAll(By.css('mat-card'));
    const table = fixture.debugElement.query(By.css('table'));

    expect(cards.length).toBe(mockItems.length);
    expect(table).toBeNull();
  });

  describe('ngOnInit', () => {
    it('should set totalItems based on items length', () => {
      component.items = mockItems;
      component.ngOnInit();
      expect(component.totalItems).toBe(mockItems.length);
    });
  });

  describe('handleAction', () => {
    it('should emit actionCalled event when an action is handled', () => {
      spyOn(component.actionCalled, 'emit');
      const mockEvent: EventAction = {
        event: new MouseEvent('click'),
        data: mockActionDatas[0],
        item: mockItems[0],
      };

      component.handleAction(mockEvent);

      expect(component.actionCalled.emit).toHaveBeenCalledWith(mockEvent);
    });
  });

  describe('getColumnKeys', () => {
    it('should return the keys of all configured columns', () => {
      component.columns = mockColumns;
      const keys = component.getColumnKeys();
      expect(keys).toEqual(['parent', 'name', 'status']);
    });
  });

  describe('getAllColumns', () => {
    it('should combine column keys, column template keys, and action column', () => {
      component.columns = mockColumns;
      component.columnTemplates = [{ key: 'country', label: 'Country' }];
      fixture.componentRef.setInput('actionDatas', mockActionDatas);

      const allCols = component.getAllColumns();

      expect(allCols).toEqual([
        'parent',
        'name',
        'status',
        'country',
        'Actions',
      ] as unknown as (keyof PollName)[]);
    });

    it('should omit template columns when columnTemplates is empty', () => {
      component.columns = mockColumns;
      component.columnTemplates = [];
      fixture.componentRef.setInput('actionDatas', mockActionDatas);

      const allCols = component.getAllColumns();

      expect(allCols).toEqual([
        'parent',
        'name',
        'status',
        'Actions',
      ] as unknown as (keyof PollName)[]);
    });

    it('should omit action column when actionDatas is empty', () => {
      component.columns = mockColumns;
      component.columnTemplates = [];
      fixture.componentRef.setInput('actionDatas', []);

      const allCols = component.getAllColumns();

      expect(allCols).toEqual(['parent', 'name', 'status']);
    });
  });

  describe('getTotalTemplateColumns', () => {
    it('should return the total count of column templates', () => {
      component.columnTemplates = [{ key: 'country', label: 'Country' }];
      expect(component.getTotalTemplateColumns()).toBe(1);

      component.columnTemplates = [];
      expect(component.getTotalTemplateColumns()).toBe(0);
    });
  });

  describe('showElement', () => {
    it('should return the raw property value when no pipe is provided', () => {
      const column: Column<PollName> = { key: 'name', label: 'Name' };
      const value = component.showElement(mockItems[0], column);
      expect(value).toBe('John Doe');
    });

    it('should apply pipe to element when no pipeKey or pipeArgs exist', () => {
      const mockPipe: PipeTransform = {
        transform: jasmine
          .createSpy('transform')
          .and.returnValue('TRANSFORMED'),
      };
      const column: Column<PollName> = {
        key: 'name',
        label: 'Name',
        pipe: mockPipe,
      };

      const value = component.showElement(mockItems[0], column);

      expect(mockPipe.transform).toHaveBeenCalledWith(mockItems[0]);
      expect(value).toBe('TRANSFORMED');
    });

    it('should apply pipe to the value defined by pipeKey', () => {
      const mockPipe: PipeTransform = {
        transform: jasmine.createSpy('transform').and.returnValue('JOHN DOE'),
      };
      const column: Column<PollName> = {
        key: 'status',
        label: 'Status',
        pipe: mockPipe,
        pipeKey: 'name',
      };

      const value = component.showElement(mockItems[0], column);

      expect(mockPipe.transform).toHaveBeenCalledWith('John Doe');
      expect(value).toBe('JOHN DOE');
    });

    it('should pass pipeArgs to the pipe transform function', () => {
      const mockPipe: PipeTransform = {
        transform: jasmine.createSpy('transform').and.returnValue('FORMATTED'),
      };
      const column: Column<PollName> = {
        key: 'status',
        label: 'Status',
        pipe: mockPipe,
        pipeKey: 'name',
        pipeArgs: ['arg1', 'arg2'],
      };

      const value = component.showElement(mockItems[0], column);

      expect(mockPipe.transform).toHaveBeenCalledWith(
        'John Doe',
        'arg1',
        'arg2'
      );
      expect(value).toBe('FORMATTED');
    });
  });

  describe('getTemplateForColumn', () => {
    it('should return template from templateMap when it exists', () => {
      const mockTemplate = {} as TemplateRef<unknown>;
      component.templateMap.set('customCol', mockTemplate);

      expect(component.getTemplateForColumn('customCol')).toBe(mockTemplate);
    });

    it('should return null when column does not exist in templateMap', () => {
      expect(component.getTemplateForColumn('unknownCol')).toBeNull();
    });
  });

  describe('isVisible', () => {
    it('should return true when actionData does not define isVisible', () => {
      const action = mockActionDatas[0];
      expect(component.isVisible(action, mockItems[0])).toBeTrue();
    });

    it('should evaluate isVisible function with item when provided', () => {
      const actionWithCondition: ActionDataWithCondition<PollName> = {
        columnId: 'actions',
        ngIconName: 'edit',
        label: 'Edit Active Only',
        id: 'active-only',
        isVisible: (item: PollName) => item.status === 'Active',
      };

      expect(component.isVisible(actionWithCondition, mockItems[0])).toBeTrue();
      expect(
        component.isVisible(actionWithCondition, mockItems[1])
      ).toBeFalse();
    });
  });

  describe('hasTextAttribute', () => {
    it('should return true when at least one action contains a text property', () => {
      const actionsWithText: ActionDatas = [
        {
          columnId: 'actions',
          ngIconName: 'edit',
          label: 'Action',
          id: 'act-1',
          text: 'Sample Text',
        },
        {
          columnId: 'actions',
          ngIconName: 'delete',
          label: 'Action 2',
          id: 'act-2',
        },
      ];
      fixture.componentRef.setInput('actionDatas', actionsWithText);

      expect(component.hasTextAttribute()).toBeTrue();
    });

    it('should return false when no action contains a text property', () => {
      fixture.componentRef.setInput('actionDatas', mockActionDatas);

      expect(component.hasTextAttribute()).toBeFalse();
    });
  });
});
