import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { FeatureFlagsService } from '@core/components/feature-flags/feature-flags.service';

import { DynamicChartsV2Component } from './dynamic-charts-v2.component';
import { DynamicChartsComponent } from '../dynamic-charts/dynamic-charts.component';
import { FeatureFlagsName } from '@core/components/feature-flags/feature-flags.model';

@Component({
  selector: 'app-dynamic-charts-container',
  imports: [DynamicChartsComponent, DynamicChartsV2Component],
  template: `
    @if (showV2) {
      <app-dynamic-charts--v2></app-dynamic-charts--v2>
    } @else {
      <app-dynamic-charts></app-dynamic-charts>
    }
  `,
})
export class DynamicChartContainerComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly featureFlags = inject(FeatureFlagsService);

  showV2 = false;
  ngOnInit(): void {
    this.showV2 = this.featureFlags.isEnabled(
      FeatureFlagsName.DYNAMIC_CHARTS_V2
    );
  }
}
