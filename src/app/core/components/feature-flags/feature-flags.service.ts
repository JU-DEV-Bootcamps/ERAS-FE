import { Injectable, computed, inject } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Router } from '@angular/router';

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
  private router = inject(Router);
  private queryParams = computed(() => {
    return this.router.routerState.root.snapshot.queryParams;
  });

  isEnabled(flag: string): boolean {
    if (environment.production) return false;

    const params = this.queryParams();

    if (params['v2'] === 'true') return true;

    return params[flag] === 'true';
  }
}
