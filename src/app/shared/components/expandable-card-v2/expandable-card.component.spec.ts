import {
  ComponentFixture,
  fakeAsync,
  TestBed,
  tick,
} from '@angular/core/testing';

import { ExpandableCardComponent } from './expandable-card.component';
import { ElementRef, SimpleChange } from '@angular/core';
import { PdfHelper } from '@core/utils/reports/exportReport.util';

describe('ExpandableCardComponent', () => {
  let component: ExpandableCardComponent;
  let fixture: ComponentFixture<ExpandableCardComponent>;
  let pdfHelper: jasmine.SpyObj<PdfHelper>;

  beforeEach(async () => {
    pdfHelper = jasmine.createSpyObj<PdfHelper>('PdfHelper', [
      'exportCardToPdf',
    ]);
    pdfHelper.exportCardToPdf.and.resolveTo();

    await TestBed.configureTestingModule({
      imports: [ExpandableCardComponent],
      providers: [
        {
          provide: PdfHelper,
          useValue: pdfHelper,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ExpandableCardComponent);
    component = fixture.componentInstance;
    component.cardId = 'card-1';
    component.title = 'Test Card';
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
  });

  describe('initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize with loading state', () => {
      expect(component.isLoading()).toBeTrue();
    });

    it('should have heatmap selected by default', () => {
      expect(component.selectedChart).toBe('heatmap');
    });
  });

  describe('transitioning input', () => {
    it('should set loading to true when transitioning is true', () => {
      component.transitioning = true;
      expect(component.isLoading()).toBeTrue();
    });

    it('should schedule loading to end after 870ms', fakeAsync(() => {
      component.transitioning = true;
      expect(component.isLoading()).toBeTrue();
      tick(869);
      expect(component.isLoading()).toBeTrue();
      tick(1);
      expect(component.isLoading()).toBeFalse();
    }));
  });

  describe('ngOnChanges', () => {
    it('should not restart loading on the first expanded change', fakeAsync(() => {
      component.isLoading.set(false);
      component.ngOnChanges({
        expanded: new SimpleChange(undefined, true, true),
      });
      expect(component.isLoading()).toBeFalse();
      tick(600);
      expect(component.isLoading()).toBeFalse();
    }));

    it('should restart loading when expanded changes after the first change', fakeAsync(() => {
      component.isLoading.set(false);
      component.ngOnChanges({
        expanded: new SimpleChange(false, true, false),
      });
      expect(component.isLoading()).toBeTrue();
      tick(599);
      expect(component.isLoading()).toBeTrue();
      tick(1);
      expect(component.isLoading()).toBeFalse();
    }));

    it('should dispatch resize event 420ms after expanded changes', fakeAsync(() => {
      const dispatchEventSpy = spyOn(window, 'dispatchEvent');
      component.ngOnChanges({
        expanded: new SimpleChange(false, true, false),
      });
      expect(dispatchEventSpy).not.toHaveBeenCalled();
      tick(419);
      expect(dispatchEventSpy).not.toHaveBeenCalled();
      tick(1);
      expect(dispatchEventSpy).toHaveBeenCalledWith(
        jasmine.objectContaining({
          type: 'resize',
        })
      );
    }));

    it('should not react when expanded is not part of the changes', fakeAsync(() => {
      component.isLoading.set(false);
      component.ngOnChanges({
        title: new SimpleChange('Old title', 'New title', false),
      });
      expect(component.isLoading()).toBeFalse();
      tick(600);
      expect(component.isLoading()).toBeFalse();
    }));
  });

  describe('ngOnDestroy', () => {
    it('should clear the loading timer', fakeAsync(() => {
      const clearTimeoutSpy = spyOn(window, 'clearTimeout').and.callThrough();
      component.transitioning = true;
      component.ngOnDestroy();
      expect(clearTimeoutSpy).toHaveBeenCalled();
    }));

    it('should not throw when destroyed without a loading timer', () => {
      component.ngOnDestroy();
      expect(true).toBeTrue();
    });
  });

  describe('onToggle', () => {
    it('should emit the card id', () => {
      const emitSpy = spyOn(component.toggleExpand, 'emit');
      component.cardId = 'test-card';
      component.onToggle();
      expect(emitSpy).toHaveBeenCalledOnceWith('test-card');
    });
  });

  describe('changeToColumn', () => {
    it('should select column chart', () => {
      component.changeToColumn();
      expect(component.selectedChart).toBe('column');
    });

    it('should emit column chart selection', () => {
      const emitSpy = spyOn(component.changeChart, 'emit');
      component.changeToColumn();
      expect(emitSpy).toHaveBeenCalledOnceWith('column');
    });
  });

  describe('changeToHeatmap', () => {
    it('should select heatmap chart', () => {
      component.selectedChart = 'column';
      component.changeToHeatmap();
      expect(component.selectedChart).toBe('heatmap');
    });

    it('should emit heatmap chart selection', () => {
      const emitSpy = spyOn(component.changeChart, 'emit');
      component.changeToHeatmap();
      expect(emitSpy).toHaveBeenCalledOnceWith('heatmap');
    });
  });

  describe('host bindings', () => {
    it('should add is-expanded class when expanded is true', () => {
      component.expanded = true;
      fixture.detectChanges();
      expect(fixture.nativeElement.classList).toContain('is-expanded');
    });

    it('should not add is-expanded class when expanded is false', () => {
      component.expanded = false;
      fixture.detectChanges();
      expect(fixture.nativeElement.classList).not.toContain('is-expanded');
    });

    it('should add is-dimmed class when dimmed is true', () => {
      component.dimmed = true;
      fixture.detectChanges();
      expect(fixture.nativeElement.classList).toContain('is-dimmed');
    });

    it('should not add is-dimmed class when dimmed is false', () => {
      component.dimmed = false;
      fixture.detectChanges();
      expect(fixture.nativeElement.classList).not.toContain('is-dimmed');
    });
  });

  describe('onExportPdf', () => {
    it('should emit true before exporting', fakeAsync(() => {
      const exportingValues: boolean[] = [];
      component.exporting.subscribe((value: boolean) => {
        exportingValues.push(value);
      });
      component.cardRef = new ElementRef<HTMLElement>(
        document.createElement('div')
      );
      void component.onExportPdf();
      expect(exportingValues).toEqual([true]);
      tick(100);
    }));

    it('should export the card with the correct options', fakeAsync(() => {
      component.cardRef = new ElementRef<HTMLElement>(
        document.createElement('div')
      );
      void component.onExportPdf();
      tick(100);
      expect(pdfHelper.exportCardToPdf).toHaveBeenCalledOnceWith({
        container: component.cardRef,
        fileName: 'card',
        title: 'Test Card',
      });
    }));

    it('should emit false after successful export', fakeAsync(() => {
      const exportingValues: boolean[] = [];
      component.exporting.subscribe((value: boolean) => {
        exportingValues.push(value);
      });
      component.cardRef = new ElementRef<HTMLElement>(
        document.createElement('div')
      );
      void component.onExportPdf();
      expect(exportingValues).toEqual([true]);
      tick(100);
      expect(exportingValues).toEqual([true, false]);
    }));
  });
});
