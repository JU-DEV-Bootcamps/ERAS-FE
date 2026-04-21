import { Injectable } from '@angular/core';
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
  isEnabled(flag: string): boolean {
    if (environment.production) return false;

    const params = new URLSearchParams(window.location.search);

    if (params.get('v2') === 'true') return true;

    return params.get(flag) === 'true';
  }
}
