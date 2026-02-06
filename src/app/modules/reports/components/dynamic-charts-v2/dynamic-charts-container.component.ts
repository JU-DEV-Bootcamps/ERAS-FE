import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { EvaluationModel } from '@core/models/evaluation.model';
import { FEATURE_FLAGS } from '@core/components/feature-flags/feature-flags';

import { FeatureFlagsService } from '@core/components/feature-flags/feature-flags.service';

import { DynamicChartsComponent } from '../dynamic-charts/dynamic-charts.component';
import { DynamicChartsV2Component } from './dynamic-charts-v2.component';

@Component({
  selector: 'app-dynamic-charts-container',
  imports: [DynamicChartsComponent, DynamicChartsV2Component],
  template: `
    @if (showV2) {
      <app-dynamic-charts-v2
        [evaluations]="evaluations()"
      ></app-dynamic-charts-v2>
    } @else {
      <app-dynamic-charts></app-dynamic-charts>
    }
  `,
})
export class DynamicChartsContainerComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly featureFlags = inject(FeatureFlagsService);
  showV2 = this.featureFlags.isEnabled(FEATURE_FLAGS.dynamicCharts);
  readonly evaluations = signal<EvaluationModel[]>(
    this.route.snapshot.data['evaluations'] as EvaluationModel[]
  );
}
