import { inject, Injectable } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { environment } from 'src/environments/environment';

/**
 * Service responsible for evaluating feature flags based on URL query parameters.
 *
 * Behavior:
 * 1.In production, feature flags are restricted and cannot be arbitrarily enabled.
 * 2.In non-production environments, feature flags can be toggled via query params
 *   for testing and validation purposes.
 *
 * Example:
 *   ?newSection=true or ?newSection=false.
 */
@Injectable({ providedIn: 'root' })
export class FeatureFlagsService {
  private readonly route = inject(ActivatedRoute);

  isEnabled(flag: string): boolean {
    const param = this.route.snapshot.queryParamMap.get(flag);

    // PROD: Restricts use of feature flags on Production.
    if (environment.production) {
      return param === 'false';
    }

    // NON-PROD: Works with query params, only available for testing mode.
    return param === 'true';
  }
}
