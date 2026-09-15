import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TableComponent } from './table.component';

interface TestRow {
  id: number;
  name: string;
}

describe('TableComponent', () => {
  let component: TableComponent<TestRow>;
  let fixture: ComponentFixture<TableComponent<TestRow>>;

  const setWindowWidth = (width: number) => {
    Object.defineProperty(window, 'innerWidth', {
      configurable: true,
      writable: true,
      value: width,
    });
  };

  const originalInnerWidth = window.innerWidth;

  afterEach(() => {
    setWindowWidth(originalInnerWidth);
  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TableComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TableComponent<TestRow>);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
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

    it('should treat exactly 768px as not mobile (boundary check)', () => {
      setWindowWidth(768);

      window.dispatchEvent(new Event('resize'));

      expect(component.isMobile).toBeFalse();
    });

    it('should treat 767px as mobile (boundary check)', () => {
      setWindowWidth(767);

      window.dispatchEvent(new Event('resize'));

      expect(component.isMobile).toBeTrue();
    });
  });
});
