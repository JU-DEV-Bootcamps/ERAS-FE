import {
  ComponentFixture,
  fakeAsync,
  TestBed,
  tick,
} from '@angular/core/testing';

import { ExpandableCardComponent } from './expandable-card.component';
import { ElementRef, SimpleChange, signal } from '@angular/core';
import { PdfHelper } from '@core/utils/reports/exportReport.util';
import { ViewportService } from '@core/services/layout/viewport.service';
import { DESKTOP_EXPORT_WIDTH } from '@modules/reports/components/summary-charts/constants/export-conf';

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
        desktopWidth: DESKTOP_EXPORT_WIDTH.card,
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

describe('ExpandableCardComponent on mobile and desktop screens', () => {
  let fixture: ComponentFixture<ExpandableCardComponent>;

  const render = async (mobile: boolean) => {
    await TestBed.configureTestingModule({
      imports: [ExpandableCardComponent],
      providers: [
        { provide: PdfHelper, useValue: {} },
        {
          provide: ViewportService,
          useValue: {
            isMobile: signal(mobile),
            renderAsDesktop: signal(false),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ExpandableCardComponent);
    fixture.componentInstance.cardId = 'card-1';
    document.body.appendChild(fixture.nativeElement);
    Object.assign((fixture.nativeElement as HTMLElement).style, {
      display: 'block',
      width: '343px',
      height: '300px',
    });
    fixture.detectChanges();
  };

  afterEach(() => fixture.nativeElement.remove());

  const overlaps = (a: DOMRect, b: DOMRect) =>
    a.left < b.right &&
    b.left < a.right &&
    a.top < b.bottom &&
    b.top < a.bottom;

  it('[674-improve-reports-charts-mobile-view/AC-5] keeps the card buttons inside the card and off the chart title on mobile', async () => {
    await render(true);

    const host = fixture.nativeElement as HTMLElement;
    const cardRect = host.querySelector('.card')!.getBoundingClientRect();
    const buttons = ['.pdf-export', '.change-to-column', '.toggle-btn'].map(
      selector => host.querySelector(selector)!.getBoundingClientRect()
    );
    const body = host.querySelector<HTMLElement>('.card-body')!;
    const contentTop =
      body.getBoundingClientRect().top +
      parseFloat(getComputedStyle(body).paddingTop);

    buttons.forEach(rect => {
      expect(rect.left).toBeGreaterThanOrEqual(cardRect.left);
      expect(rect.right).toBeLessThanOrEqual(cardRect.right);
      expect(rect.top).toBeGreaterThanOrEqual(cardRect.top);
      expect(contentTop).toBeGreaterThanOrEqual(rect.bottom);
    });
    expect(overlaps(buttons[0], buttons[1])).toBeFalse();
    expect(overlaps(buttons[1], buttons[2])).toBeFalse();
    expect(overlaps(buttons[0], buttons[2])).toBeFalse();
  });

  it('keeps the card body padding on a desktop screen', async () => {
    await render(false);

    const body = (fixture.nativeElement as HTMLElement).querySelector(
      '.card-body'
    )!;
    expect(getComputedStyle(body).paddingTop).toBe('8px');
  });
});
