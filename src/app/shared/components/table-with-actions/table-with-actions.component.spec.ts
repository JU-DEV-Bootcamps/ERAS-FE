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
import { PollName } from '../../../core/models/poll-request.model';
import { Column } from '../list/types/column';
import { ActionDatas } from '../list/types/action';

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
    component.actionDatas = mockActionDatas;

    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should render action buttons in the Actions column', () => {
    const rowInfos = fixture.debugElement.queryAll(
      By.css('.row-info') //app-table-with-actions tr for desktop version
    );
    const actionButtons = fixture.debugElement.queryAll(
      By.css('app-action-button')
    );

    expect(rowInfos.length).toBe(mockItems.length * mockColumns.length);
    expect(actionButtons.length).toBe(
      mockItems.length * mockActionDatas.length
    );
  });

  it('should render cards instead of a table when in mobile view', () => {
    component.isMobile = true;
    fixture.detectChanges();

    const cards = fixture.debugElement.queryAll(By.css('mat-card'));
    const table = fixture.debugElement.query(By.css('table'));

    expect(cards.length).toBe(mockItems.length);
    expect(table).toBeNull();
  });
});
