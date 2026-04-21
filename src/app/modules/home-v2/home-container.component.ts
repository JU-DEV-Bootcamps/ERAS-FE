import { Component, inject } from '@angular/core';
import { FeatureFlagsService } from '@core/components/feature-flags/feature-flags.service';
import { FEATURE_FLAGS } from '@core/components/feature-flags/feature-flags';
import { HomeComponent } from '@modules/home/home.component';
import { HomeV2Component } from './home.component';

@Component({
  selector: 'app-home-container',
  imports: [HomeComponent, HomeV2Component],
  template: `
    @if (showV2) {
      <app-home-v2></app-home-v2>
    } @else {
      <app-home></app-home>
    }
  `,
})
export class HomeContainerComponent {
  private readonly featureFlags = inject(FeatureFlagsService);
  showV2 = this.featureFlags.isEnabled(FEATURE_FLAGS.home);
}
