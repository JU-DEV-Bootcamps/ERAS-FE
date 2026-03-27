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
  styles: [
    `
      :host {
        display: block;
        pointer-events: none;
      }

      .apex-cdk-tooltip {
        background: #1e2130;
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 10px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
        max-width: 400px;
        font-size: 13px;
        color: #f0f0f5;
        overflow: hidden;

        // Estilos para el HTML que viene de customTooltip()
        ::ng-deep .apexcharts-tooltip-x {
          padding: 10px 14px 4px;
          font-size: 14px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          margin-bottom: 0;
        }

        ::ng-deep .apexcharts-tooltip-y {
          padding: 6px 14px;
          font-size: 13px;
          color: #9d9d9d;
          margin-bottom: 0;
        }

        ::ng-deep .apexcharts-tooltip-z {
          padding: 4px 14px 10px;
          font-size: 12px;
          color: #c0c0c0;
        }

        // Override de estilos inline que vienen del customTooltip
        ::ng-deep [style*='padding: 10px'] {
          padding: 0 !important;
        }

        ::ng-deep [style*='font-size: 18px'] {
          font-size: 14px !important;
        }

        ::ng-deep [style*='font-size: 16px'] {
          font-size: 13px !important;
        }

        ::ng-deep [style*='border-top'] {
          margin: 0 14px !important;
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ApexTooltipComponent {
  @Input() html = '';

  constructor(public cdr: ChangeDetectorRef) {}
}
