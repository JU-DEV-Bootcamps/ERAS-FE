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

  // Guardamos los handlers para poder removerlos
  private boundMouseMove = this.onMouseMove.bind(this);
  private boundMouseLeave = this.onMouseLeave.bind(this);

  constructor(
    private el: ElementRef<HTMLElement>,
    private overlay: Overlay,
    private positionBuilder: OverlayPositionBuilder
  ) {
    // Escuchamos en el host (el div que envuelve apx-chart)
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

  // ── Eventos ───────────────────────────────────────────────────────────────

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

  // ── Leer la celda activa del heatmap ──────────────────────────────────────

  private getHeatmapCellAt(
    event: MouseEvent
  ): { seriesIndex: number; dataPointIndex: number } | null {
    const target = event.target as SVGElement;
    // ApexCharts pone data-* en cada rect del heatmap
    const rect =
      target.closest<SVGElement>('[data\\:value]') ??
      target.closest<SVGElement>('.apexcharts-heatmap-rect');

    if (!rect) return null;

    // Leer índices desde los atributos del elemento SVG
    const j = rect.getAttribute('j'); // dataPointIndex
    const i = rect.getAttribute('i'); // seriesIndex (ApexCharts usa 'i' en algunos builds)

    // Fallback: buscar en el parent series group
    const seriesGroup =
      rect.closest<SVGElement>('[data\\:realindex]') ??
      rect.closest<SVGElement>('.apexcharts-series');

    const seriesIndex =
      i != null
        ? parseInt(i, 10)
        : seriesGroup?.getAttribute('data:realindex') != null
          ? parseInt(seriesGroup.getAttribute('data:realindex')!, 10)
          : -1;

    const dataPointIndex = j != null ? parseInt(j, 10) : -1;

    if (seriesIndex === -1 || dataPointIndex === -1) return null;

    return { seriesIndex, dataPointIndex };
  }

  // ── Mostrar / ocultar ─────────────────────────────────────────────────────

  private show(html: string, event: MouseEvent): void {
    if (!this.overlayRef) {
      this.createOverlay();
    }

    // Actualizar contenido
    if (this.compRef) {
      this.compRef.instance.html = html;
      this.compRef.instance.cdr.detectChanges();
    }

    // Seguir el mouse
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
      positionStrategy: this.overlay.position().global(), // posición manual via updatePosition
    });
  }

  private updatePosition(event: MouseEvent): void {
    if (!this.overlayRef) return;

    const offsetX = 16;
    const offsetY = -8;

    // Usa global strategy para posicionar exactamente donde está el mouse
    const strategy = this.overlay
      .position()
      .global()
      .left(`${event.clientX + offsetX}px`)
      .top(`${event.clientY + offsetY}px`);

    this.overlayRef.updatePositionStrategy(strategy);
    this.overlayRef.updatePosition();
  }
}
