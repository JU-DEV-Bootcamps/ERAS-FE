import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  HostBinding,
  Input,
  Output,
  OnChanges,
  SimpleChanges,
  inject,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { PdfHelper } from '@core/utils/reports/exportReport.util';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';

@Component({
  selector: 'app-expandable-card',
  imports: [MatIconModule, MatTooltipModule, MatMenuModule],
  templateUrl: './expandable-card.component.html',
  styleUrl: './expandable-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExpandableCardComponent implements OnChanges {
  @Input() cardId!: string;
  @Input() expanded = false;
  @Input() dimmed = false;
  @Input() title = '';

  @Output() toggleExpand = new EventEmitter<string>();
  @Output() exporting = new EventEmitter<boolean>();
  @Output() changeChart = new EventEmitter<'heatmap' | 'column'>();

  @HostBinding('class.is-expanded') get hostExpanded() {
    return this.expanded;
  }
  @HostBinding('class.is-dimmed') get hostDimmed() {
    return this.dimmed;
  }
  pdfHelper = inject(PdfHelper);
  @ViewChild('cardRef') cardRef!: ElementRef<HTMLElement>;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['expanded']) {
      setTimeout(() => window.dispatchEvent(new Event('resize')), 420);
    }
  }

  onToggle(): void {
    this.toggleExpand.emit(this.cardId);
  }

  async onExportPdf() {
    this.exporting.emit(true);
    await new Promise(resolve => setTimeout(resolve, 100));
    await this.pdfHelper
      .exportCardToPdf({
        container: this.cardRef,
        fileName: 'card',
        title: this.title,
      })
      .finally(() => {
        this.exporting.emit(false);
      });
  }

  changeToColumn(): void {
    this.changeChart.emit('column');
  }

  changeToHeatmap(): void {
    this.changeChart.emit('heatmap');
  }
}
