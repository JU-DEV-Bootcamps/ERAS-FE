import {
  Directive,
  ElementRef,
  OnDestroy,
  Input,
  ComponentRef,
  inject,
  input,
} from '@angular/core';
import {
  Overlay,
  OverlayRef,
  OverlayPositionBuilder,
} from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { ApexTooltipComponent } from './apex-tooltip.component';
import { ViewportService } from '@core/services/layout/viewport.service';

const TAP_EVENTS = ['touchstart', 'mousedown', 'mouseup', 'click'];

@Directive({
  selector: '[appApexTooltip]',
  standalone: true,
})
export class ApexTooltipDirective implements OnDestroy {
  // Función que recibe (seriesIndex, dataPointIndex) y retorna el HTML del tooltip
  @Input() appApexTooltip!: (x: number, y: number) => string;
  readonly appApexTooltipEnabled = input(true);

  private overlayRef: OverlayRef | null = null;
  private compRef: ComponentRef<ApexTooltipComponent> | null = null;

  private boundMouseMove = this.onMouseMove.bind(this);
  private boundMouseLeave = this.onMouseLeave.bind(this);
  private boundPointerDownCapture = this.onPointerDownCapture.bind(this);
  private boundTapEventCapture = this.onTapEventCapture.bind(this);
  private boundOutsidePointerDown = this.onOutsidePointerDown.bind(this);

  private readonly viewport = inject(ViewportService);
  private armedKey: string | null = null;
  private blockTap = false;
  private suppressTooltip = false;

  constructor(
    private el: ElementRef<HTMLElement>,
    private overlay: Overlay,
    private positionBuilder: OverlayPositionBuilder
  ) {
    this.el.nativeElement.addEventListener('mousemove', this.boundMouseMove);
    this.el.nativeElement.addEventListener('mouseleave', this.boundMouseLeave);
    this.el.nativeElement.addEventListener(
      'pointerdown',
      this.boundPointerDownCapture,
      true
    );
    TAP_EVENTS.forEach(name =>
      this.el.nativeElement.addEventListener(
        name,
        this.boundTapEventCapture,
        true
      )
    );
    document.addEventListener('pointerdown', this.boundOutsidePointerDown);
  }

  ngOnDestroy(): void {
    this.hide();
    this.overlayRef?.dispose();
    this.overlayRef = null;
    this.el.nativeElement.removeEventListener('mousemove', this.boundMouseMove);
    this.el.nativeElement.removeEventListener(
      'pointerdown',
      this.boundPointerDownCapture,
      true
    );
    TAP_EVENTS.forEach(name =>
      this.el.nativeElement.removeEventListener(
        name,
        this.boundTapEventCapture,
        true
      )
    );
    document.removeEventListener('pointerdown', this.boundOutsidePointerDown);
    this.el.nativeElement.removeEventListener(
      'mouseleave',
      this.boundMouseLeave
    );
  }

  private onMouseMove(event: MouseEvent): void {
    if (!this.appApexTooltipEnabled() || this.suppressTooltip) {
      this.hide();
      return;
    }
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
    this.armedKey = this.cellKey(cell);
  }

  private onMouseLeave(): void {
    this.hide();
  }

  private onPointerDownCapture(event: Event): void {
    this.blockTap = false;
    this.suppressTooltip = false;
    if (!this.appApexTooltipEnabled() || !this.viewport.isMobile()) return;

    const cell = this.getHeatmapCellAt(event);
    if (!cell) {
      this.hide();
      return;
    }

    if (this.cellKey(cell) === this.armedKey) {
      this.hide();
      this.suppressTooltip = true;
      return;
    }
    this.blockTap = true;
  }

  private onTapEventCapture(event: Event): void {
    if (this.blockTap) event.stopPropagation();
  }

  private onOutsidePointerDown(event: Event): void {
    if (this.el.nativeElement.contains(event.target as Node)) return;
    this.hide();
  }

  private cellKey(cell: {
    seriesIndex: number;
    dataPointIndex: number;
  }): string {
    return `${cell.seriesIndex}-${cell.dataPointIndex}`;
  }

  private getHeatmapCellAt(
    event: Event
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

    if (!this.overlayRef!.hasAttached()) {
      this.compRef = this.overlayRef!.attach(
        new ComponentPortal(ApexTooltipComponent)
      );
    }

    if (this.compRef) {
      this.compRef.instance.html = html;
      this.compRef.instance.cdr.detectChanges();
    }

    this.updatePosition(event);
  }

  private hide(): void {
    this.overlayRef?.detach();
    this.compRef = null;
    this.armedKey = null;
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
    const tooltipEl = this.overlayRef.overlayElement
      .firstElementChild as HTMLElement;

    const tooltipWidth = tooltipEl?.offsetWidth ?? 402;
    const tooltipHeight = tooltipEl?.offsetHeight ?? 400;

    const screenWidth = document.documentElement.clientWidth;
    const screenHeight = document.documentElement.clientHeight;
    const screenMargin = 8;
    let left: number;
    let top: number;

    if (this.viewport.isMobile()) {
      const pointGap = 16;
      const above = event.clientY - tooltipHeight - pointGap;
      left = event.clientX - tooltipWidth / 2;
      top = above >= screenMargin ? above : event.clientY + pointGap;
      top = Math.max(
        screenMargin,
        Math.min(top, screenHeight - tooltipHeight - screenMargin)
      );
    } else {
      const spaceOnRight = window.innerWidth - event.clientX;
      const spaceOnBottom = window.innerHeight - event.clientY;
      const showOnLeft = spaceOnRight < tooltipWidth + offsetX;
      const showOnTop = spaceOnBottom < tooltipHeight + offsetY;

      left = showOnLeft
        ? event.clientX - tooltipWidth - offsetX
        : event.clientX + offsetX;
      top = showOnTop
        ? event.clientY - tooltipHeight - offsetY
        : event.clientY + offsetY;
    }

    left = Math.max(
      screenMargin,
      Math.min(left, screenWidth - tooltipWidth - screenMargin)
    );

    const strategy = this.overlay
      .position()
      .global()
      .left(`${left}px`)
      .top(`${top}px`);

    this.overlayRef.updatePositionStrategy(strategy);
    this.overlayRef.updatePosition();
  }
}
