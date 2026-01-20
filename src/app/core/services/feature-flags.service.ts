import { Injectable } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { environment } from 'src/environments/environment';

type FeatureFlag = keyof typeof environment.featureFlags;

@Injectable({ providedIn: 'root' })
export class FeatureFlagsService {
  constructor(private route: ActivatedRoute) {}

  isEnabled(flag: FeatureFlag): boolean {
    const param = this.route.snapshot.queryParamMap.get(flag);
    const envEnabled = environment.featureFlags?.[flag];

    // PROD: A feature flag requires explicit enable.
    if (environment.production) {
      return envEnabled === true;
    }

    // NON-PROD: it works with env OR query param.
    return envEnabled === true || param === 'true';
  }
}
