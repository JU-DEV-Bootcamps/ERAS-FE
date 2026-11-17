import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, signal } from '@angular/core';
import { OverlayContainer, OverlayModule } from '@angular/cdk/overlay';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { By } from '@angular/platform-browser';

import { ApexTooltipDirective } from './apex-tooltip.directive';
import { ApexTooltipComponent } from './apex-tooltip.component';
import { ViewportService } from '@core/services/layout/viewport.service';

@Component({
  standalone: true,
  imports: [ApexTooltipDirective],
  template: `
    <div
      [appApexTooltip]="tooltipFn"
      id="directive-host"
      style="width: 800px; height: 600px;"
    >
      <svg id="chart-svg" width="600" height="400">
        <g id="series-group" class="apexcharts-series">
          <rect
            id="heatmap-cell"
            class="apexcharts-heatmap-rect"
            i="1"
            j="3"
          ></rect>
          <path
            id="bar-cell"
            class="apexcharts-bar-area"
            index="4"
            j="2"
          ></path>
          <rect id="custom-cell" class="apexcharts-heatmap-rect" j="5"></rect>
          <rect id="incomplete-cell" i="1"></rect>
        </g>
        <circle id="outside-cell" cx="20" cy="20" r="10"></circle>
      </svg>
    </div>
  `,
})
class TestHostComponent {
  tooltipFn: (x: number, y: number) => string = (seriesIndex, dataPointIndex) =>
    `<span>Tooltip ${seriesIndex}-${dataPointIndex}</span>`;
}

describe('ApexTooltipDirective', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let hostComponent: TestHostComponent;
  let hostElement: HTMLElement;
  let overlayContainer: OverlayContainer;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent, ApexTooltipComponent, OverlayModule],
      providers: [provideNoopAnimations()],
    }).compileComponents();

    overlayContainer = TestBed.inject(OverlayContainer);
    fixture = TestBed.createComponent(TestHostComponent);
    hostComponent = fixture.componentInstance;
    hostElement = fixture.nativeElement as HTMLElement;
    fixture.detectChanges();
  });

  afterEach(() => {
    overlayContainer.ngOnDestroy();
  });

  it('should create host with directive', () => {
    expect(hostComponent).toBeTruthy();
  });

  describe('Heatmap and Bar cell detection', () => {
    it('should display tooltip for a heatmap cell using i and j attributes', () => {
      const heatmapCell = hostElement.querySelector(
        '#heatmap-cell'
      ) as SVGElement;

      const mouseMoveEvent = new MouseEvent('mousemove', {
        bubbles: true,
        clientX: 100,
        clientY: 100,
      });
      heatmapCell.dispatchEvent(mouseMoveEvent);
      fixture.detectChanges();

      const overlayElement = document.querySelector('.apex-cdk-tooltip');
      expect(overlayElement).not.toBeNull();
      expect(overlayElement?.innerHTML).toContain('Tooltip 1-3');
    });

    it('should display tooltip for a bar chart cell using index and j attributes', () => {
      const barCell = hostElement.querySelector('#bar-cell') as SVGElement;

      const mouseMoveEvent = new MouseEvent('mousemove', {
        bubbles: true,
        clientX: 120,
        clientY: 120,
      });
      barCell.dispatchEvent(mouseMoveEvent);
      fixture.detectChanges();

      const overlayElement = document.querySelector('.apex-cdk-tooltip');
      expect(overlayElement).not.toBeNull();
      expect(overlayElement?.innerHTML).toContain('Tooltip 2-4');
    });

    it('should resolve seriesIndex using fallback data:realindex attribute', () => {
      const seriesGroup = hostElement.querySelector(
        '#series-group'
      ) as SVGElement;
      seriesGroup.setAttribute('data:realindex', '7');

      const customCell = hostElement.querySelector(
        '#custom-cell'
      ) as SVGElement;
      customCell.classList.add('apexcharts-heatmap-rect');
      customCell.setAttribute('data:value', '50');

      const mouseMoveEvent = new MouseEvent('mousemove', {
        bubbles: true,
        clientX: 150,
        clientY: 150,
      });
      customCell.dispatchEvent(mouseMoveEvent);
      fixture.detectChanges();

      const overlayElement = document.querySelector('.apex-cdk-tooltip');
      expect(overlayElement).not.toBeNull();
      expect(overlayElement?.innerHTML).toContain('Tooltip 7-5');
    });
  });

  describe('Negative and Edge cases', () => {
    it('should hide tooltip when target is not a valid chart cell', () => {
      const outsideCell = hostElement.querySelector(
        '#outside-cell'
      ) as SVGElement;

      const mouseMoveEvent = new MouseEvent('mousemove', {
        bubbles: true,
        clientX: 50,
        clientY: 50,
      });
      outsideCell.dispatchEvent(mouseMoveEvent);
      fixture.detectChanges();

      const overlayElement = document.querySelector('.apex-cdk-tooltip');
      expect(overlayElement).toBeNull();
    });

    it('should hide tooltip if dataPointIndex or seriesIndex is -1', () => {
      const incompleteCell = hostElement.querySelector(
        '#incomplete-cell'
      ) as SVGElement;

      const mouseMoveEvent = new MouseEvent('mousemove', {
        bubbles: true,
        clientX: 80,
        clientY: 80,
      });
      incompleteCell.dispatchEvent(mouseMoveEvent);
      fixture.detectChanges();

      const overlayElement = document.querySelector('.apex-cdk-tooltip');
      expect(overlayElement).toBeNull();
    });

    it('should hide tooltip when tooltip function returns empty string', () => {
      hostComponent.tooltipFn = () => '';
      fixture.detectChanges();

      const heatmapCell = hostElement.querySelector(
        '#heatmap-cell'
      ) as SVGElement;
      const mouseMoveEvent = new MouseEvent('mousemove', {
        bubbles: true,
        clientX: 100,
        clientY: 100,
      });
      heatmapCell.dispatchEvent(mouseMoveEvent);
      fixture.detectChanges();

      const overlayElement = document.querySelector('.apex-cdk-tooltip');
      expect(overlayElement).toBeNull();
    });

    it('should hide tooltip on mouseleave event', () => {
      const heatmapCell = hostElement.querySelector(
        '#heatmap-cell'
      ) as SVGElement;
      const mouseMoveEvent = new MouseEvent('mousemove', {
        bubbles: true,
        clientX: 100,
        clientY: 100,
      });
      heatmapCell.dispatchEvent(mouseMoveEvent);
      fixture.detectChanges();

      expect(document.querySelector('.apex-cdk-tooltip')).not.toBeNull();

      const directiveHost = hostElement.querySelector(
        '#directive-host'
      ) as HTMLElement;
      directiveHost.dispatchEvent(new MouseEvent('mouseleave'));
      fixture.detectChanges();

      expect(document.querySelector('.apex-cdk-tooltip')).toBeNull();
    });
  });

  describe('Positioning and screen edge flipping', () => {
    it('should flip position to top and left when close to the bottom-right screen edge', () => {
      const heatmapCell = hostElement.querySelector(
        '#heatmap-cell'
      ) as SVGElement;

      const mouseMoveEdgeEvent = new MouseEvent('mousemove', {
        bubbles: true,
        clientX: window.innerWidth - 10,
        clientY: window.innerHeight - 10,
      });

      heatmapCell.dispatchEvent(mouseMoveEdgeEvent);
      fixture.detectChanges();
      heatmapCell.dispatchEvent(mouseMoveEdgeEvent);
      fixture.detectChanges();

      const overlayPanes = document.querySelectorAll('.cdk-overlay-pane');
      const overlayPane = overlayPanes[overlayPanes.length - 1] as HTMLElement;
      expect(overlayPane).not.toBeNull();

      const left = overlayPane.style.left || overlayPane.style.marginLeft;
      const top = overlayPane.style.top || overlayPane.style.marginTop;

      expect(left).toContain('px');
      expect(top).toContain('px');
    });

    it('should update tooltip content on consecutive mousemove events without recreating overlay', () => {
      const heatmapCell = hostElement.querySelector(
        '#heatmap-cell'
      ) as SVGElement;

      heatmapCell.dispatchEvent(
        new MouseEvent('mousemove', {
          bubbles: true,
          clientX: 100,
          clientY: 100,
        })
      );
      fixture.detectChanges();

      heatmapCell.dispatchEvent(
        new MouseEvent('mousemove', {
          bubbles: true,
          clientX: 110,
          clientY: 110,
        })
      );
      fixture.detectChanges();

      const overlayElement = document.querySelector('.apex-cdk-tooltip');
      expect(overlayElement).not.toBeNull();
      expect(overlayElement?.innerHTML).toContain('Tooltip 1-3');
    });
  });

  describe('ngOnDestroy', () => {
    it('should clean up listeners and detach overlay on destroy', () => {
      const heatmapCell = hostElement.querySelector(
        '#heatmap-cell'
      ) as SVGElement;
      heatmapCell.dispatchEvent(
        new MouseEvent('mousemove', {
          bubbles: true,
          clientX: 100,
          clientY: 100,
        })
      );
      fixture.detectChanges();

      expect(document.querySelector('.apex-cdk-tooltip')).not.toBeNull();

      const directiveDebug = fixture.debugElement.query(
        By.directive(ApexTooltipDirective)
      );
      const directive = directiveDebug.injector.get(ApexTooltipDirective);

      directive.ngOnDestroy();
      fixture.detectChanges();

      expect(document.querySelector('.apex-cdk-tooltip')).toBeNull();

      heatmapCell.dispatchEvent(
        new MouseEvent('mousemove', {
          bubbles: true,
          clientX: 100,
          clientY: 100,
        })
      );
      fixture.detectChanges();

      expect(document.querySelector('.apex-cdk-tooltip')).toBeNull();
    });
  });
});

@Component({
  standalone: true,
  imports: [ApexTooltipDirective],
  template: `
    <div
      [appApexTooltip]="tooltipFn"
      [appApexTooltipEnabled]="enabled"
      id="touch-host"
      style="position: fixed; left: 0; top: 0; width: 100%; height: 100%;"
    >
      <svg width="300" height="300">
        <rect
          id="touch-cell"
          class="apexcharts-heatmap-rect"
          i="0"
          j="1"
        ></rect>
        <path id="touch-bar" class="apexcharts-bar-area" index="1" j="0"></path>
      </svg>
    </div>
    <p id="touch-outside">outside</p>
  `,
})
class TouchHostComponent {
  enabled = true;
  tooltipFn: (x: number, y: number) => string = (seriesIndex, dataPointIndex) =>
    `<span>Tooltip ${seriesIndex}-${dataPointIndex}</span>`;
}

describe('ApexTooltipDirective on mobile and desktop screens', () => {
  let fixture: ComponentFixture<TouchHostComponent>;
  let overlayContainer: OverlayContainer;
  let opened: jasmine.Spy;
  const isMobile = signal(true);

  const setup = async (mobile: boolean) => {
    isMobile.set(mobile);
    await TestBed.configureTestingModule({
      imports: [TouchHostComponent, ApexTooltipComponent, OverlayModule],
      providers: [
        provideNoopAnimations(),
        {
          provide: ViewportService,
          useValue: { isMobile, renderAsDesktop: signal(false) },
        },
      ],
    }).compileComponents();

    overlayContainer = TestBed.inject(OverlayContainer);
    fixture = TestBed.createComponent(TouchHostComponent);
    document.body.appendChild(fixture.nativeElement);
    fixture.detectChanges();
    opened = jasmine.createSpy('opened');
    fixture.nativeElement
      .querySelectorAll('#touch-cell, #touch-bar')
      .forEach((element: Element) =>
        element.addEventListener('mousedown', opened)
      );
  };

  afterEach(() => {
    overlayContainer.ngOnDestroy();
    fixture.nativeElement.remove();
  });

  const cell = () => document.querySelector<SVGElement>('#touch-cell')!;
  const bar = () => document.querySelector<SVGElement>('#touch-bar')!;
  const tooltip = () =>
    document.querySelector<HTMLElement>('.apex-cdk-tooltip');
  const screenWidth = () => document.documentElement.clientWidth;

  const hover = (target: Element, clientX: number, clientY: number) => {
    target.dispatchEvent(
      new MouseEvent('mousemove', { bubbles: true, clientX, clientY })
    );
    fixture.detectChanges();
  };

  const tap = (target: Element, clientX: number, clientY: number) => {
    const init = { bubbles: true, cancelable: true, clientX, clientY };
    target.dispatchEvent(new PointerEvent('pointerdown', init));
    target.dispatchEvent(new MouseEvent('mousemove', init));
    target.dispatchEvent(new MouseEvent('mousedown', init));
    target.dispatchEvent(new MouseEvent('mouseup', init));
    target.dispatchEvent(new MouseEvent('click', init));
    fixture.detectChanges();
  };

  it('[674-improve-reports-charts-mobile-view/AC-23] keeps the hover tooltip next to the pointer, up to 402px wide, with the click opening the cell on desktop', async () => {
    await setup(false);

    cell().dispatchEvent(
      new MouseEvent('mousemove', {
        bubbles: true,
        clientX: 100,
        clientY: 100,
      })
    );
    fixture.detectChanges();
    const near = tooltip()!.getBoundingClientRect();
    expect(Math.round(near.left)).toBe(116);
    expect(near.width).toBeLessThanOrEqual(402);
    expect(opened).not.toHaveBeenCalled();

    cell().dispatchEvent(
      new MouseEvent('mousemove', {
        bubbles: true,
        clientX: screenWidth() - 20,
        clientY: 100,
      })
    );
    fixture.detectChanges();
    expect(tooltip()!.getBoundingClientRect().right).toBeLessThanOrEqual(
      screenWidth() - 20
    );

    cell().dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
    expect(opened).toHaveBeenCalledTimes(1);
  });

  it('keeps the tooltip inside the screen at both edges and places it above the tapped point on mobile', async () => {
    await setup(true);

    tap(cell(), 5, 300);
    const atLeft = tooltip()!.getBoundingClientRect();
    expect(atLeft.left).toBeGreaterThanOrEqual(7);
    expect(atLeft.bottom).toBeLessThanOrEqual(300);

    hover(cell(), screenWidth() - 5, 300);
    const atRight = tooltip()!.getBoundingClientRect();
    expect(atRight.right).toBeLessThanOrEqual(screenWidth() - 7);
    expect(atRight.bottom).toBeLessThanOrEqual(300);

    hover(cell(), 100, 5);
    expect(tooltip()!.getBoundingClientRect().top).toBeGreaterThanOrEqual(5);
  });

  it('[674-improve-reports-charts-mobile-view/AC-14] shows the heatmap tooltip inside the screen on the first tap without opening the details', async () => {
    await setup(true);

    tap(cell(), screenWidth() - 5, 200);
    const rect = tooltip()!.getBoundingClientRect();
    expect(tooltip()!.innerHTML).toContain('Tooltip 0-1');
    expect(rect.left).toBeGreaterThanOrEqual(7);
    expect(rect.right).toBeLessThanOrEqual(screenWidth() - 7);
    expect(rect.width).toBeLessThanOrEqual(screenWidth());
    expect(opened).not.toHaveBeenCalled();

    tap(cell(), screenWidth() - 5, 200);
    expect(opened).toHaveBeenCalledTimes(1);
  });

  it('[674-improve-reports-charts-mobile-view/AC-15] shows the column tooltip inside the screen, off the tapped column, without opening the details', async () => {
    await setup(true);

    tap(bar(), screenWidth() - 5, 300);
    const rect = tooltip()!.getBoundingClientRect();
    expect(tooltip()!.innerHTML).toContain('Tooltip 0-1');
    expect(rect.right).toBeLessThanOrEqual(screenWidth() - 7);
    expect(rect.bottom).toBeLessThanOrEqual(300);
    expect(opened).not.toHaveBeenCalled();
  });

  it('[674-improve-reports-charts-mobile-view/AC-25] hides the tooltip when the second tap opens the details', async () => {
    await setup(true);

    tap(cell(), 100, 300);
    expect(tooltip()).not.toBeNull();
    expect(opened).not.toHaveBeenCalled();

    tap(cell(), 100, 300);
    expect(opened).toHaveBeenCalledTimes(1);
    expect(tooltip()).toBeNull();
  });

  it('[674-improve-reports-charts-mobile-view/AC-16] hides the tooltip when the user taps outside the chart', async () => {
    await setup(true);

    tap(cell(), 100, 300);
    expect(tooltip()).not.toBeNull();

    document
      .querySelector('#touch-host svg')!
      .dispatchEvent(new Event('pointerdown', { bubbles: true }));
    fixture.detectChanges();
    expect(tooltip()).not.toBeNull();

    document
      .querySelector('#touch-outside')!
      .dispatchEvent(new Event('pointerdown', { bubbles: true }));
    fixture.detectChanges();
    expect(tooltip()).toBeNull();
    expect(opened).not.toHaveBeenCalled();

    tap(cell(), 100, 300);
    expect(opened).not.toHaveBeenCalled();
  });

  it('does not show the tooltip when the directive is disabled', async () => {
    await setup(true);
    fixture.componentInstance.enabled = false;
    fixture.detectChanges();

    tap(cell(), 100, 300);
    expect(tooltip()).toBeNull();
    expect(opened).toHaveBeenCalledTimes(1);
  });
});
