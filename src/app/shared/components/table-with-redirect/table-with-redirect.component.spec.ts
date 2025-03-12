import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TableWithRedirectComponent } from './table-with-redirect.component';

describe('TableWithRedirectComponent', () => {
  let component: TableWithRedirectComponent;
  let fixture: ComponentFixture<TableWithRedirectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TableWithRedirectComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TableWithRedirectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
