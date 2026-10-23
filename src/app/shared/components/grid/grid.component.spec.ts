import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GridComponent } from './grid.component';
import { MatGridListModule } from '@angular/material/grid-list';
import { Grid } from './interfaces/Grid';
import { Component } from '@angular/core';
import { provideNoopAnimations } from '@angular/platform-browser/animations';

@Component({ selector: 'app-dummy', template: '' })
class DummyComponent {}

class FakeResizeObserver implements ResizeObserver {
  static instances: FakeResizeObserver[] = [];
  callback: ResizeObserverCallback;
  observe = jasmine.createSpy('observe');
  unobserve = jasmine.createSpy('unobserve');
  disconnect = jasmine.createSpy('disconnect');

  constructor(callback: ResizeObserverCallback) {
    this.callback = callback;
    FakeResizeObserver.instances.push(this);
  }
}

describe('GridComponent', () => {
  let component: GridComponent;
  let fixture: ComponentFixture<GridComponent>;
  let originalResizeObserver: typeof ResizeObserver;

  const mockStaticGrid: Grid = {
    type: 'static',
    rows: 2,
    cols: 4,
    rowHeight: '100px',
    gutterSize: 10,
    tiles: [{ component: DummyComponent, inputs: {}, rowspan: 2, colspan: 1 }],
  };

  const mockMultiStaticGrid: Grid = {
    type: 'static',
    rows: 2,
    cols: 4,
    rowHeight: '100px',
    gutterSize: 10,
    tiles: [
      { component: DummyComponent, inputs: {}, rowspan: 2, colspan: 1 },
      { component: DummyComponent, inputs: {}, rowspan: 1, colspan: 3 },
    ],
  };

  const mockDynamicGrid: Grid = {
    type: 'dynamic',
    rows: 2,
    cols: 4,
    rowHeight: '100px',
    gutterSize: 10,
    tiles: [
      {
        component: DummyComponent,
        inputs: {},
        spans: [
          { breakpoint: 600, rowspan: 1, colspan: 1 },
          { breakpoint: 900, rowspan: 2, colspan: 2 },
          { breakpoint: 1200, rowspan: 3, colspan: 3 },
        ],
      },
    ],
  };

  beforeEach(async () => {
    FakeResizeObserver.instances = [];
    originalResizeObserver = window.ResizeObserver;
    (window as unknown as { ResizeObserver: unknown }).ResizeObserver =
      FakeResizeObserver;

    await TestBed.configureTestingModule({
      imports: [GridComponent, MatGridListModule],
      providers: [provideNoopAnimations()],
    }).compileComponents();

    fixture = TestBed.createComponent(GridComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    (window as unknown as { ResizeObserver: unknown }).ResizeObserver =
      originalResizeObserver;
  });

  it('should create', () => {
    component.grid = mockStaticGrid;
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  describe('static span logic', () => {
    it('should assign the spans directly if the grid is static', () => {
      component.grid = mockStaticGrid;
      fixture.detectChanges();

      const spans = component.getSpans();

      expect(spans[0].rowspan).toBe(2);
      expect(spans[0].colspan).toBe(1);
    });

    it('should return one span per tile when the grid has multiple static tiles', () => {
      component.grid = mockMultiStaticGrid;
      fixture.detectChanges();

      const spans = component.getSpans();

      expect(spans.length).toBe(2);
      expect(spans[0]).toEqual({ colspan: 1, rowspan: 2, breakpoint: 0 });
      expect(spans[1]).toEqual({ colspan: 3, rowspan: 1, breakpoint: 0 });
    });
  });

  describe('dynamic span logic', () => {
    it('should select the first span that exceeding breakpoint)', () => {
      component.grid = mockDynamicGrid;
      component.width.set(500);
      fixture.detectChanges();

      const spans = component.getSpans();

      expect(spans[0].breakpoint).toBe(600);
      expect(spans[0].rowspan).toBe(1);
    });

    it('should select an intermediate span when width falls between breakpoints', () => {
      component.grid = mockDynamicGrid;
      component.width.set(700);
      fixture.detectChanges();

      const spans = component.getSpans();

      expect(spans[0].breakpoint).toBe(900);
      expect(spans[0].rowspan).toBe(2);
    });

    it('should select the largest span if the width exceeds all breakpoints', () => {
      component.grid = mockDynamicGrid;
      component.width.set(1500);
      fixture.detectChanges();

      const spans = component.getSpans();

      expect(spans[0].breakpoint).toBe(600);
    });
  });

  describe('ngAfterViewInit / ResizeObserver setup', () => {
    it('should create a ResizeObserver and observe the host element', () => {
      component.grid = mockStaticGrid;
      fixture.detectChanges();

      expect(FakeResizeObserver.instances.length).toBe(1);
      expect(FakeResizeObserver.instances[0].observe).toHaveBeenCalledWith(
        fixture.nativeElement
      );
    });

    it('should update width, height and spans when the ResizeObserver callback fires', () => {
      component.grid = mockDynamicGrid;
      fixture.detectChanges();

      const instance = FakeResizeObserver.instances[0];
      const entries = [
        { contentRect: { width: 700, height: 400 } },
      ] as unknown as ResizeObserverEntry[];

      instance.callback(entries, instance);

      expect(component.width()).toBe(700);
      expect(component.height()).toBe(400);
      expect(component.spans[0].breakpoint).toBe(900);
    });

    it('should process the last entry values when multiple entries are reported', () => {
      component.grid = mockStaticGrid;
      fixture.detectChanges();

      const instance = FakeResizeObserver.instances[0];
      const entries = [
        { contentRect: { width: 100, height: 100 } },
        { contentRect: { width: 300, height: 250 } },
      ] as unknown as ResizeObserverEntry[];

      instance.callback(entries, instance);

      expect(component.width()).toBe(300);
      expect(component.height()).toBe(250);
    });
  });

  describe('ngOnDestroy', () => {
    it('should disconnect the ResizeObserver', () => {
      component.grid = mockStaticGrid;
      fixture.detectChanges();

      const instance = FakeResizeObserver.instances[0];
      component.ngOnDestroy();

      expect(instance.disconnect).toHaveBeenCalled();
    });

    it('should not throw when the ResizeObserver was never created', () => {
      expect(() => component.ngOnDestroy()).not.toThrow();
    });
  });

  describe('lifecicle', () => {
    it('should update the width when the ResizeObserver detects changes', done => {
      component.grid = mockStaticGrid;
      fixture.detectChanges();

      component.width.set(800);
      fixture.detectChanges();

      expect(component.getColspan(0)).toBe(1);
      done();
    });
  });

  describe('template', () => {
    it('return 1 if the index does not exist', () => {
      component.grid = mockStaticGrid;
      component.spans = [];

      expect(component.getRowspan(99)).toBe(1);
      expect(component.getColspan(99)).toBe(1);
    });
  });
});
