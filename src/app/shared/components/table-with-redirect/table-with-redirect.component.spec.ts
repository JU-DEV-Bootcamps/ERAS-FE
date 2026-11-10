import { signal, WritableSignal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';

import { ViewportService } from '@core/services/layout/viewport.service';
import { TableWithRedirectComponent } from './table-with-redirect.component';

describe('TableWithRedirectComponent', () => {
  let component: TableWithRedirectComponent;
  let fixture: ComponentFixture<TableWithRedirectComponent>;
  let routerSpy: jasmine.SpyObj<Router>;
  let isMobile: WritableSignal<boolean>;

  afterEach(() => {
    localStorage.clear();
  });

  beforeEach(async () => {
    isMobile = signal(false);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [TableWithRedirectComponent],
      providers: [
        { provide: Router, useValue: routerSpy },
        { provide: ViewportService, useValue: { isMobile } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TableWithRedirectComponent);
    component = fixture.componentInstance;
  });

  it('[669-unify-mobile-detection-and-touch-targets/AC-3] switches the table with redirect between cards and table with the screen size', () => {
    // GIVEN the table with redirect showing two rows with their columns and the detail button
    component.columns = ['name', 'status'];
    component.dataSource = [
      { name: 'Ana', status: 'Active' },
      { name: 'Luis', status: 'Inactive' },
    ];
    component.icon = 'visibility';
    const host = fixture.nativeElement as HTMLElement;

    // WHEN the screen is 375px wide
    isMobile.set(true);
    fixture.detectChanges();

    // THEN each row is a card with its detail button and no table is shown
    const cards = Array.from(host.querySelectorAll<HTMLElement>('mat-card'));
    expect(cards.length).toBe(2);
    cards.forEach(card => {
      expect(card.querySelectorAll('button').length).toBe(1);
    });
    expect(cards[0].textContent).toContain('Ana');
    expect(host.querySelector('table')).toBeNull();

    // AND when it is resized to 1280px a table with a detail button per row is shown and no card is
    isMobile.set(false);
    fixture.detectChanges();

    expect(host.querySelector('table')).not.toBeNull();
    expect(host.querySelectorAll('tr.mat-mdc-row').length).toBe(2);
    expect(host.querySelectorAll('td button').length).toBe(2);
    expect(host.querySelectorAll('mat-card').length).toBe(0);
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should set totalItems to dataSource.length', () => {
      component.dataSource = [{ id: 1 }, { id: 2 }, { id: 3 }];

      fixture.detectChanges();

      expect(component.totalItems).toBe(3);
    });

    it('should set totalItems to 0 when dataSource is empty', () => {
      component.dataSource = [];

      fixture.detectChanges();

      expect(component.totalItems).toBe(0);
    });
  });

  describe('redirectToDetail', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should store the uuid in localStorage and navigate when uuid, redirectPath, and itemStorage are all present', () => {
      component.uuidField = 'id';
      component.redirectPath = '/students/detail';
      component.itemStorage = 'selectedStudentId';

      const item = { id: 'abc-123', name: 'John' };
      component.redirectToDetail(item);

      expect(localStorage.getItem('selectedStudentId')).toBe('abc-123');
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/students/detail']);
    });

    it('should not navigate or store anything when uuid is missing from the item', () => {
      spyOn(console, 'error');
      component.uuidField = 'id';
      component.redirectPath = '/students/detail';
      component.itemStorage = 'selectedStudentId';

      const item = { name: 'John' };
      component.redirectToDetail(item);

      expect(routerSpy.navigate).not.toHaveBeenCalled();
      expect(localStorage.getItem('selectedStudentId')).toBeNull();
      expect(console.error).toHaveBeenCalledWith(
        'Missing uuid, redirectPath, or itemStorage'
      );
    });

    it('should not navigate when redirectPath is empty', () => {
      spyOn(console, 'error');
      component.uuidField = 'id';
      component.redirectPath = '';
      component.itemStorage = 'selectedStudentId';

      const item = { id: 'abc-123' };
      component.redirectToDetail(item);

      expect(routerSpy.navigate).not.toHaveBeenCalled();
      expect(console.error).toHaveBeenCalledWith(
        'Missing uuid, redirectPath, or itemStorage'
      );
    });

    it('should not navigate when itemStorage is empty', () => {
      spyOn(console, 'error');
      component.uuidField = 'id';
      component.redirectPath = '/students/detail';
      component.itemStorage = '';

      const item = { id: 'abc-123' };
      component.redirectToDetail(item);

      expect(routerSpy.navigate).not.toHaveBeenCalled();
      expect(console.error).toHaveBeenCalledWith(
        'Missing uuid, redirectPath, or itemStorage'
      );
    });

    it('should not navigate when uuidField does not exist on the item', () => {
      spyOn(console, 'error');
      component.uuidField = 'nonExistentField';
      component.redirectPath = '/students/detail';
      component.itemStorage = 'selectedStudentId';

      const item = { id: 'abc-123' };
      component.redirectToDetail(item);

      expect(routerSpy.navigate).not.toHaveBeenCalled();
      expect(console.error).toHaveBeenCalled();
    });
  });
});
