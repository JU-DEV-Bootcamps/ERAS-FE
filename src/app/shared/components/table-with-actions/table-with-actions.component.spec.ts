import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TableWithActionsComponent } from './table-with-actions.component';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TitleCasePipe } from '@angular/common';
import { By } from '@angular/platform-browser';
import { PollName } from '@core/models/poll-request.model';
import { Column } from '../list/types/column';
import { ActionDatas } from '../list/types/action';

interface SelectablePollName extends PollName {
  isSelected?: boolean;
}

type SelectableFixture = ComponentFixture<
  TableWithActionsComponent<SelectablePollName>
>;

describe('TableWithActionsComponent', () => {
  let component: TableWithActionsComponent<PollName>;
  let fixture: ComponentFixture<TableWithActionsComponent<PollName>>;

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

  const originalInnerWidth = window.innerWidth;

  const setWindowWidth = (width: number) => {
    Object.defineProperty(window, 'innerWidth', {
      configurable: true,
      writable: true,
      value: width,
    });
  };

  afterEach(() => {
    setWindowWidth(originalInnerWidth);
  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        MatTableModule,
        MatPaginatorModule,
        MatButtonModule,
        MatIconModule,
        MatCardModule,
        MatProgressSpinnerModule,
      ],
      providers: [TitleCasePipe],
    }).compileComponents();

    fixture = TestBed.createComponent(TableWithActionsComponent<PollName>);
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

  describe('ngOnInit', () => {
    it('should set totalItems to items.length', () => {
      expect(component.totalItems).toBe(mockItems.length);
    });

    it('should set isMobile based on window width at init time', async () => {
      setWindowWidth(500);
      const localFixture = TestBed.createComponent(
        TableWithActionsComponent<PollName>
      );
      const localComponent = localFixture.componentInstance;
      localComponent.items = mockItems;
      localComponent.columns = mockColumns;
      localFixture.componentRef.setInput('actionDatas', mockActionDatas);

      localFixture.detectChanges();

      expect(localComponent.isMobile).toBeTrue();
    });

    it('should set displayedColumns from getAllColumns()', () => {
      expect(component.displayedColumns).toEqual(component.getAllColumns());
      expect(component.displayedColumns).toEqual([
        'parent',
        'name',
        'status',
        'Actions',
      ]);
    });
  });

  describe('onResize', () => {
    it('should set isMobile to true when window width drops below 768', () => {
      setWindowWidth(600);

      window.dispatchEvent(new Event('resize'));

      expect(component.isMobile).toBeTrue();
    });

    it('should set isMobile to false when window width is 768 or above', () => {
      setWindowWidth(1024);

      window.dispatchEvent(new Event('resize'));

      expect(component.isMobile).toBeFalse();
    });
  });

  describe('getAllColumns', () => {
    it('should build columns from columns + columnTemplates when columnOrder is empty', () => {
      component.columnTemplates = [{ key: 'country', label: 'Country' }];

      const result = component.getAllColumns();

      expect(result).toEqual([
        'parent',
        'name',
        'status',
        'country',
        'Actions',
      ]);
    });

    it('should use columnOrder when provided, ignoring columns/columnTemplates order', () => {
      component.columnOrder = [
        { key: 'status', label: 'Status' },
        { key: 'parent', label: 'Parent' },
      ];

      const result = component.getAllColumns();

      expect(result).toEqual(['status', 'parent', 'Actions']);
    });

    it('should prepend "isSelected" when itemsAreSelectable is true', () => {
      component.itemsAreSelectable = true;

      const result = component.getAllColumns();

      expect(result[0]).toBe('isSelected');
    });

    it('should not include "Actions" when actionDatas is empty', () => {
      fixture.componentRef.setInput('actionDatas', []);

      const result = component.getAllColumns();

      expect(result).not.toContain('Actions');
    });
  });

  describe('getColumnKeys', () => {
    it('should return the string keys of columns', () => {
      expect(component.getColumnKeys()).toEqual(['parent', 'name', 'status']);
    });
  });

  describe('getTotalTemplateColumns', () => {
    it('should return the number of columnTemplates', () => {
      component.columnTemplates = [
        { key: 'country', label: 'Country' },
        { key: 'selectData', label: 'Select Data' },
      ];

      expect(component.getTotalTemplateColumns()).toBe(2);
    });
  });

  describe('showElement', () => {
    it('should return the raw value when the column has no pipe', () => {
      const result = component.showElement(mockItems[0], mockColumns[1]);
      expect(result).toBe('John Doe');
    });

    it('should transform the value through column.pipe when provided', () => {
      const mockPipe = {
        transform: jasmine.createSpy().and.returnValue('TRANSFORMED'),
      };
      const columnWithPipe: Column<PollName> = {
        key: 'status',
        label: 'Status',
        pipe: mockPipe as unknown as Column<PollName>['pipe'],
      };

      const result = component.showElement(mockItems[0], columnWithPipe);

      expect(mockPipe.transform).toHaveBeenCalledWith(mockItems[0]);
      expect(result).toBe('TRANSFORMED');
    });

    it('should pass pipeArgs to the pipe when provided', () => {
      const mockPipe = { transform: jasmine.createSpy().and.returnValue('OK') };
      const columnWithPipeArgs: Column<PollName> = {
        key: 'status',
        label: 'Status',
        pipe: mockPipe as unknown as Column<PollName>['pipe'],
        pipeArgs: ['arg1', 'arg2'],
      };

      component.showElement(mockItems[0], columnWithPipeArgs);

      expect(mockPipe.transform).toHaveBeenCalledWith(
        mockItems[0],
        'arg1',
        'arg2'
      );
    });

    it('should use pipeKey to select the raw value passed to the pipe', () => {
      const mockPipe = { transform: jasmine.createSpy().and.returnValue('OK') };
      const columnWithPipeKey: Column<PollName> = {
        key: 'status',
        label: 'Status',
        pipe: mockPipe as unknown as Column<PollName>['pipe'],
        pipeKey: 'name',
      };

      component.showElement(mockItems[0], columnWithPipeKey);

      expect(mockPipe.transform).toHaveBeenCalledWith('John Doe');
    });
  });

  describe('getTemplateForColumn', () => {
    it('should return null when no template is registered for the key', () => {
      expect(component.getTemplateForColumn('missing')).toBeNull();
    });
  });

  describe('isVisible', () => {
    it('should return true when the action has no isVisible condition', () => {
      expect(component.isVisible(mockActionDatas[0], mockItems[0])).toBeTrue();
    });

    it("should return the condition's result when isVisible is defined", () => {
      const conditional = {
        ...mockActionDatas[0],
        isVisible: jasmine.createSpy().and.returnValue(false),
      };

      const result = component.isVisible(conditional as never, mockItems[0]);

      expect(conditional.isVisible).toHaveBeenCalledWith(mockItems[0]);
      expect(result).toBeFalse();
    });
  });

  describe('isDisabled', () => {
    it('should return false when the action has no isDisabled condition', () => {
      expect(
        component.isDisabled(mockActionDatas[0], mockItems[0])
      ).toBeFalse();
    });

    it("should return the condition's result when isDisabled is defined", () => {
      const conditional = {
        ...mockActionDatas[0],
        isDisabled: jasmine.createSpy().and.returnValue(true),
      };

      const result = component.isDisabled(conditional as never, mockItems[0]);

      expect(conditional.isDisabled).toHaveBeenCalledWith(mockItems[0]);
      expect(result).toBeTrue();
    });
  });

  describe('hasTextAttribute', () => {
    it('should return false when no action has a "text" property', () => {
      expect(component.hasTextAttribute()).toBeFalse();
    });

    it('should return true when at least one action has a "text" property', () => {
      fixture.componentRef.setInput('actionDatas', [
        ...mockActionDatas,
        {
          columnId: 'actions',
          ngIconName: 'add',
          label: 'Add',
          id: 'id3',
          text: 'Add',
        },
      ]);

      expect(component.hasTextAttribute()).toBeTrue();
    });
  });

  describe('handleAction', () => {
    it('should emit actionCalled with the given event', () => {
      const emitSpy = spyOn(component.actionCalled, 'emit');
      const event = { id: 'id1' } as never;

      component.handleAction(event);

      expect(emitSpy).toHaveBeenCalledWith(event);
    });
  });

  describe('selection behavior', () => {
    let selectableComponent: TableWithActionsComponent<SelectablePollName>;
    let selectableFixture: SelectableFixture;
    let selectableItems: SelectablePollName[];

    beforeEach(() => {
      selectableFixture = TestBed.createComponent(
        TableWithActionsComponent<SelectablePollName>
      );
      selectableComponent = selectableFixture.componentInstance;

      selectableItems = mockItems.map(item => ({ ...item, isSelected: false }));
      selectableComponent.items = selectableItems;
      selectableComponent.columns = mockColumns;
      selectableComponent.itemsAreSelectable = true;
      selectableFixture.componentRef.setInput('actionDatas', mockActionDatas);

      selectableFixture.detectChanges();
    });

    it('should build displayCache with the string value for each column on ngOnChanges', () => {
      selectableComponent.ngOnChanges({
        items: {
          currentValue: selectableItems,
          previousValue: [],
          firstChange: true,
          isFirstChange: () => true,
        },
      });

      const cachedRow = selectableComponent.displayCache.get(
        selectableItems[0]
      );
      expect(cachedRow?.['name']).toBe('John Doe');
      expect(cachedRow?.['status']).toBe('Active');
    });

    it('should select all items when handleSelectAll is called and none are selected', () => {
      selectableComponent.handleSelectAll();

      expect(selectableItems.every(item => item.isSelected)).toBeTrue();
      expect(selectableComponent.allItemsSelected()).toBeTrue();
    });

    it('should deselect all items when handleSelectAll is called and all are selected', () => {
      selectableItems.forEach(item => (item.isSelected = true));
      selectableComponent.allItemsSelected.set(true);

      selectableComponent.handleSelectAll();

      expect(selectableItems.every(item => !item.isSelected)).toBeTrue();
      expect(selectableComponent.allItemsSelected()).toBeFalse();
    });

    it('should skip disabled items when selecting all via handleSelectAll', () => {
      selectableComponent.isItemDisabled = item => item.name === 'Jane Smith';

      selectableComponent.handleSelectAll();

      expect(selectableItems[0].isSelected).toBeTrue();
      expect(selectableItems[1].isSelected).toBeFalse();
    });

    it('should uncheck disabled items and keep allItemsSelected true when remaining selectable items are all selected', () => {
      selectableItems.forEach(item => (item.isSelected = true));
      selectableComponent.isItemDisabled = item => item.name === 'Jane Smith';

      selectableComponent.itemChecked();

      expect(selectableItems[0].isSelected).toBeTrue();
      expect(selectableItems[1].isSelected).toBeFalse();
      expect(selectableComponent.allItemsSelected()).toBeTrue();
    });

    it('should set allItemsSelected to true when every selectable item is checked', () => {
      selectableItems.forEach(item => (item.isSelected = true));

      selectableComponent.itemChecked();

      expect(selectableComponent.allItemsSelected()).toBeTrue();
    });
  });
});
