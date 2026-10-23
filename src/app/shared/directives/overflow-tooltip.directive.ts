import { Directive, ElementRef, HostListener, Input } from '@angular/core';
import { MatTooltip } from '@angular/material/tooltip';

@Directive({
  selector: '[appOverflowTooltip]',
  standalone: true,
  hostDirectives: [MatTooltip],
})
export class OverflowTooltipDirective {
  @Input() tooltipText = '';

  constructor(
    private el: ElementRef<HTMLElement>,
    private tooltip: MatTooltip
  ) {}

  @HostListener('mouseenter')
  onMouseEnter() {
    const el = this.el.nativeElement;
    this.tooltip.message =
      el.scrollWidth > el.clientWidth ? this.tooltipText : null;
  }

  @HostListener('mouseleave')
  onMouseLeave() {
    this.tooltip.hide();
  }
}
