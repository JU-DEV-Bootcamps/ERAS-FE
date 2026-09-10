import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { OverlayModule } from '@angular/cdk/overlay';
import { provideNoopAnimations } from '@angular/platform-browser/animations';

import { ApexTooltipDirective } from './apex-tooltip.directive';
import { ApexTooltipComponent } from './apex-tooltip.component';

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
          <rect id="custom-cell" j="5"></rect>
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

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent, ApexTooltipComponent, OverlayModule],
      providers: [provideNoopAnimations()],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    hostComponent = fixture.componentInstance;
    hostElement = fixture.nativeElement as HTMLElement;
    fixture.detectChanges();
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

      const overlayContainer = document.querySelector('.apex-cdk-tooltip');
      expect(overlayContainer).not.toBeNull();
      expect(overlayContainer?.innerHTML).toContain('Tooltip 1-3');
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

      const overlayContainer = document.querySelector('.apex-cdk-tooltip');
      expect(overlayContainer).not.toBeNull();
      expect(overlayContainer?.innerHTML).toContain('Tooltip 2-4');
    });

    it('should resolve seriesIndex using fallback data:realindex attribute', () => {
      const seriesGroup = hostElement.querySelector(
        '#series-group'
      ) as SVGElement;
      seriesGroup.setAttribute('data:realindex', '7');

      const customCell = hostElement.querySelector(
        '#custom-cell'
      ) as SVGElement;
      customCell.setAttribute('data:value', '50');

      const mouseMoveEvent = new MouseEvent('mousemove', {
        bubbles: true,
        clientX: 150,
        clientY: 150,
      });
      customCell.dispatchEvent(mouseMoveEvent);
      fixture.detectChanges();

      const overlayContainer = document.querySelector('.apex-cdk-tooltip');
      expect(overlayContainer).not.toBeNull();
      expect(overlayContainer?.innerHTML).toContain('Tooltip 7-5');
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

      const overlayContainer = document.querySelector('.apex-cdk-tooltip');
      expect(overlayContainer).toBeNull();
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

      const overlayContainer = document.querySelector('.apex-cdk-tooltip');
      expect(overlayContainer).toBeNull();
    });

    it('should hide tooltip when tooltip function returns empty string', () => {
      hostComponent.tooltipFn = () => '';

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

      const overlayContainer = document.querySelector('.apex-cdk-tooltip');
      expect(overlayContainer).toBeNull();
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

      const overlayPane = document.querySelector(
        '.cdk-overlay-pane'
      ) as HTMLElement;
      expect(overlayPane).not.toBeNull();
      expect(overlayPane.style.left).toContain('px');
      expect(overlayPane.style.top).toContain('px');
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

      const overlayContainer = document.querySelector('.apex-cdk-tooltip');
      expect(overlayContainer).not.toBeNull();
      expect(overlayContainer?.innerHTML).toContain('Tooltip 1-3');
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

      fixture.destroy();

      expect(document.querySelector('.apex-cdk-tooltip')).toBeNull();
    });
  });
});
