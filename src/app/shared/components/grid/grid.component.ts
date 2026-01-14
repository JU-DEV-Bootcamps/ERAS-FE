import {
  Component,
  ElementRef,
  inject,
  Input,
  signal,
  AfterViewInit,
  OnDestroy,
} from '@angular/core';
import { MatGridListModule } from '@angular/material/grid-list';
import { Grid, isStaticGrid, Span } from './interfaces/Grid';
import { NgComponentOutlet } from '@angular/common';

@Component({
  selector: 'app-grid',
  imports: [MatGridListModule, NgComponentOutlet],
  templateUrl: './grid.component.html',
  styleUrl: './grid.component.css',
})
export class GridComponent implements AfterViewInit, OnDestroy {
  private elementRef: ElementRef = inject(ElementRef);
  private resizeObserver: ResizeObserver | null = null;

  @Input({ required: true }) grid!: Grid;

  width = signal(window.innerWidth);
  height = signal(window.innerHeight);
  spans: Span[] = [];

  ngAfterViewInit() {
    this.resizeObserver = new ResizeObserver(entries => {
      for (const entry of entries) {
        const newWidth = entry.contentRect.width;
        const newHeight = entry.contentRect.height;
        const newSpans = this.getSpans();

        this.width.set(newWidth);
        this.height.set(newHeight);
        this.spans = newSpans;
      }
    });

    this.resizeObserver.observe(this.elementRef.nativeElement);
  }

  ngOnDestroy() {
    this.resizeObserver?.disconnect();
  }

  getSpans(): Span[] {
    const newSpans: Span[] = [];
    for (const tile of this.grid.tiles) {
      if (isStaticGrid(this.grid, tile)) {
        newSpans.push({
          colspan: tile.colspan,
          rowspan: tile.rowspan,
          breakpoint: 0,
        });
      } else {
        const spans = tile.spans.sort((a, b) => a.breakpoint - b.breakpoint);

        let done = false;
        let newSpan = spans[0];

        for (let i = 0; i < spans.length && !done; i++) {
          const span = spans[i];
          const breakpoint = span.breakpoint;

          if (this.width() < breakpoint) {
            newSpan = span;
            done = true;
          }
        }
        newSpans.push(newSpan);
      }
    }
    return newSpans;
  }

  getRowspan(index: number) {
    return this.spans[index]?.rowspan ?? 1;
  }

  getColspan(index: number) {
    return this.spans[index]?.colspan ?? 1;
  }
}
