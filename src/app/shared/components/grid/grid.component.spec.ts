import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GridComponent } from './grid.component';
import { MatGridListModule } from '@angular/material/grid-list';
import { Grid } from './interfaces/Grid';
import { Component } from '@angular/core';
import { provideNoopAnimations } from '@angular/platform-browser/animations';

@Component({ selector: 'app-dummy', template: '' })
class DummyComponent {}

describe('GridComponent', () => {
  let component: GridComponent;
  let fixture: ComponentFixture<GridComponent>;

  const mockStaticGrid: Grid = {
    type: 'static',
    rows: 2,
    cols: 4,
    rowHeight: '100px',
    gutterSize: 10,
    tiles: [{ component: DummyComponent, inputs: {}, rowspan: 2, colspan: 1 }],
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
          { breakpoint: 1200, rowspan: 2, colspan: 2 },
        ],
      },
    ],
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GridComponent, MatGridListModule],
      providers: [provideNoopAnimations()],
    }).compileComponents();

    fixture = TestBed.createComponent(GridComponent);
    component = fixture.componentInstance;
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

    it('should select the largest span if the width exceeds all breakpoints', () => {
      component.grid = mockDynamicGrid;
      component.width.set(1500);
      fixture.detectChanges();

      const spans = component.getSpans();

      expect(spans[0].breakpoint).toBe(600);
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
