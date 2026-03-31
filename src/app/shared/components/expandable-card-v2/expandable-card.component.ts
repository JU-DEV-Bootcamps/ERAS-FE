import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  HostBinding,
  Input,
  Output,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-expandable-card',
  imports: [MatIconModule],
  templateUrl: './expandable-card.component.html',
  styleUrl: './expandable-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExpandableCardComponent implements OnChanges {
  @Input() cardId!: string;
  @Input() expanded = false;
  @Input() dimmed = false;

  @Output() toggleExpand = new EventEmitter<string>();

  @HostBinding('class.is-expanded') get hostExpanded() {
    return this.expanded;
  }
  @HostBinding('class.is-dimmed') get hostDimmed() {
    return this.dimmed;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['expanded']) {
      setTimeout(() => window.dispatchEvent(new Event('resize')), 420);
    }
  }

  onToggle(): void {
    this.toggleExpand.emit(this.cardId);
  }
}
