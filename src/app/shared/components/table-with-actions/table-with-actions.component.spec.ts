import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TableWithActionsComponent } from './table-with-actions.component';

describe('TableWithActionsComponent', () => {
  let component: TableWithActionsComponent;
  let fixture: ComponentFixture<TableWithActionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TableWithActionsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TableWithActionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
