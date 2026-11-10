import { signal, WritableSignal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ViewportService } from '@core/services/layout/viewport.service';

import { TableComponent } from './table.component';

interface TestRow {
  id: number;
  name: string;
}

describe('TableComponent', () => {
  let component: TableComponent<TestRow>;
  let fixture: ComponentFixture<TableComponent<TestRow>>;
  let isMobile: WritableSignal<boolean>;

  beforeEach(async () => {
    isMobile = signal(false);
    await TestBed.configureTestingModule({
      imports: [TableComponent],
      providers: [{ provide: ViewportService, useValue: { isMobile } }],
    }).compileComponents();

    fixture = TestBed.createComponent(TableComponent<TestRow>);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('[669-unify-mobile-detection-and-touch-targets/AC-2] switches the table between cards and table with the screen size', () => {
    // GIVEN the table showing two rows with their columns
    component.dataSource = [
      { id: 1, name: 'Ana' },
      { id: 2, name: 'Luis' },
    ];
    component.columns = ['id', 'name'];
    const host = fixture.nativeElement as HTMLElement;

    // WHEN the screen is 375px wide
    isMobile.set(true);
    fixture.detectChanges();

    // THEN each row is a card with its columns and no table is shown
    const cards = Array.from(host.querySelectorAll<HTMLElement>('mat-card'));
    expect(cards.length).toBe(2);
    expect(cards[0].textContent).toContain('Name');
    expect(cards[0].textContent).toContain('Ana');
    expect(cards[1].textContent).toContain('Luis');
    expect(host.querySelector('table')).toBeNull();

    // AND when it is resized to 1280px a table with the same rows is shown and no card is
    isMobile.set(false);
    fixture.detectChanges();

    expect(host.querySelector('table')).not.toBeNull();
    expect(host.querySelectorAll('tr.mat-mdc-row').length).toBe(2);
    expect(host.querySelectorAll('mat-card').length).toBe(0);
  });

  it('should have empty dataSource and columns by default', () => {
    fixture.detectChanges();
    expect(component.dataSource).toEqual([]);
    expect(component.columns).toEqual([]);
  });

  describe('ngOnInit', () => {
    it('should set totalItems to the length of dataSource', () => {
      component.dataSource = [
        { id: 1, name: 'Alice' },
        { id: 2, name: 'Bob' },
        { id: 3, name: 'Carol' },
      ];

      fixture.detectChanges();

      expect(component.totalItems).toBe(3);
    });

    it('should set totalItems to 0 when dataSource is empty', () => {
      component.dataSource = [];

      fixture.detectChanges();

      expect(component.totalItems).toBe(0);
    });
  });
});
