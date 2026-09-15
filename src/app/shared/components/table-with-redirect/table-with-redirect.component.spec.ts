import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';

import { TableWithRedirectComponent } from './table-with-redirect.component';

describe('TableWithRedirectComponent', () => {
  let component: TableWithRedirectComponent;
  let fixture: ComponentFixture<TableWithRedirectComponent>;
  let routerSpy: jasmine.SpyObj<Router>;

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
    localStorage.clear();
  });

  beforeEach(async () => {
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [TableWithRedirectComponent],
      providers: [{ provide: Router, useValue: routerSpy }],
    }).compileComponents();

    fixture = TestBed.createComponent(TableWithRedirectComponent);
    component = fixture.componentInstance;
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

    it('should set isMobile to true when window width is below 768 on init', () => {
      setWindowWidth(500);

      fixture.detectChanges();

      expect(component.isMobile).toBeTrue();
    });

    it('should set isMobile to false when window width is 768 or above on init', () => {
      setWindowWidth(1024);

      fixture.detectChanges();

      expect(component.isMobile).toBeFalse();
    });
  });

  describe('onResize', () => {
    beforeEach(() => {
      setWindowWidth(1024);
      fixture.detectChanges();
    });

    it('should set isMobile to true when resized below 768px', () => {
      setWindowWidth(600);

      window.dispatchEvent(new Event('resize'));

      expect(component.isMobile).toBeTrue();
    });

    it('should set isMobile to false when resized to 768px or above', () => {
      setWindowWidth(500);
      window.dispatchEvent(new Event('resize'));
      expect(component.isMobile).toBeTrue();

      setWindowWidth(900);
      window.dispatchEvent(new Event('resize'));

      expect(component.isMobile).toBeFalse();
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
