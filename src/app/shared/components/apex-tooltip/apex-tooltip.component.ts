import {
  Component,
  Input,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
} from '@angular/core';

@Component({
  standalone: true,
  selector: 'app-apex-tooltip',
  template: ` <div class="apex-cdk-tooltip" [innerHTML]="html"></div> `,
  styleUrl: './apex-tooltip.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ApexTooltipComponent {
  @Input() html = '';

  constructor(public cdr: ChangeDetectorRef) {}
}
