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

describe('TableWithActionsComponent', () => {
  let component: TableWithActionsComponent<PollName>;
  let fixture: ComponentFixture<TableWithActionsComponent<PollName>>;

  const mockItems: PollName[] = [
    { parent: 'parent', name: 'John Doe', status: 'Active' },
    { parent: 'other parent', name: 'Jane Smith', status: 'Inactive' },
  ];

  const mockColumns: Column<PollName>[] = [
    { key: 'parent', label: 'Parent' },
    { key: 'name', label: 'Name' },
    { key: 'status', label: 'Status' },
  ];

  const mockActionDatas = [
    { columnId: 'edit', text: 'Edit', label: 'Edit' },
    { columnId: 'delete', ngIconName: 'delete', label: 'Delete' },
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
    const actionButtons = fixture.debugElement.queryAll(
      By.css('app-action-button')
    );

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
