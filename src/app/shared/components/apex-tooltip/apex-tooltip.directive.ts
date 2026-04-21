import {
  Directive,
  ElementRef,
  OnDestroy,
  Input,
  ComponentRef,
} from '@angular/core';
import {
  Overlay,
  OverlayRef,
  OverlayPositionBuilder,
} from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { ApexTooltipComponent } from './apex-tooltip.component';

@Directive({
  selector: '[appApexTooltip]',
  standalone: true,
})
export class ApexTooltipDirective implements OnDestroy {
  // Función que recibe (seriesIndex, dataPointIndex) y retorna el HTML del tooltip
  @Input() appApexTooltip!: (x: number, y: number) => string;

  private overlayRef: OverlayRef | null = null;
  private compRef: ComponentRef<ApexTooltipComponent> | null = null;

  private boundMouseMove = this.onMouseMove.bind(this);
  private boundMouseLeave = this.onMouseLeave.bind(this);

  constructor(
    private el: ElementRef<HTMLElement>,
    private overlay: Overlay,
    private positionBuilder: OverlayPositionBuilder
  ) {
    this.el.nativeElement.addEventListener('mousemove', this.boundMouseMove);
    this.el.nativeElement.addEventListener('mouseleave', this.boundMouseLeave);
  }

  ngOnDestroy(): void {
    this.hide();
    this.el.nativeElement.removeEventListener('mousemove', this.boundMouseMove);
    this.el.nativeElement.removeEventListener(
      'mouseleave',
      this.boundMouseLeave
    );
  }

  private onMouseMove(event: MouseEvent): void {
    const cell = this.getHeatmapCellAt(event);
    if (!cell) {
      this.hide();
      return;
    }

    const { seriesIndex, dataPointIndex } = cell;
    const html = this.appApexTooltip(seriesIndex, dataPointIndex);
    if (!html) {
      this.hide();
      return;
    }

    this.show(html, event);
  }

  private onMouseLeave(): void {
    this.hide();
  }

  private getHeatmapCellAt(
    event: MouseEvent
  ): { seriesIndex: number; dataPointIndex: number } | null {
    const target = event.target as SVGElement;

    const el =
      target.closest<SVGElement>('[data\\:value]') ??
      target.closest<SVGElement>('.apexcharts-heatmap-rect') ??
      target.closest<SVGElement>('.apexcharts-bar-area');

    if (!el) return null;

    const isHeatmap = el.classList.contains('apexcharts-heatmap-rect');
    const isBar = el.classList.contains('apexcharts-bar-area');

    let seriesIndex = -1;
    let dataPointIndex = -1;

    if (isHeatmap) {
      const i = el.getAttribute('i');
      const j = el.getAttribute('j');

      seriesIndex = i != null ? parseInt(i, 10) : -1;
      dataPointIndex = j != null ? parseInt(j, 10) : -1;
    }

    if (isBar) {
      const i = el.getAttribute('index');
      const j = el.getAttribute('j');

      seriesIndex = j != null ? parseInt(j, 10) : -1;
      dataPointIndex = i != null ? parseInt(i, 10) : -1;
    }

    if (seriesIndex === -1) {
      const seriesGroup =
        el.closest<SVGElement>('[data\\:realindex]') ??
        el.closest<SVGElement>('.apexcharts-series');

      const fallbackSeries = seriesGroup?.getAttribute('data:realindex');
      if (fallbackSeries != null) {
        seriesIndex = parseInt(fallbackSeries, 10);
      }
    }

    if (seriesIndex === -1 || dataPointIndex === -1) return null;

    return { seriesIndex, dataPointIndex };
  }

  private show(html: string, event: MouseEvent): void {
    if (!this.overlayRef) {
      this.createOverlay();
    }

    if (this.compRef) {
      this.compRef.instance.html = html;
      this.compRef.instance.cdr.detectChanges();
    }

    this.updatePosition(event);

    if (!this.overlayRef!.hasAttached()) {
      this.compRef = this.overlayRef!.attach(
        new ComponentPortal(ApexTooltipComponent)
      );
      this.compRef.instance.html = html;
      this.compRef.instance.cdr.detectChanges();
    }
  }

  private hide(): void {
    this.overlayRef?.detach();
    this.compRef = null;
  }

  private createOverlay(): void {
    this.overlayRef = this.overlay.create({
      hasBackdrop: false,
      scrollStrategy: this.overlay.scrollStrategies.reposition(),
      positionStrategy: this.overlay.position().global(),
    });
  }

  private updatePosition(event: MouseEvent): void {
    if (!this.overlayRef) return;

    const offsetX = 16;
    const offsetY = -8;
    const strategy = this.overlay
      .position()
      .global()
      .left(`${event.clientX + offsetX}px`)
      .top(`${event.clientY + offsetY}px`);

    this.overlayRef.updatePositionStrategy(strategy);
    this.overlayRef.updatePosition();
  }
}
