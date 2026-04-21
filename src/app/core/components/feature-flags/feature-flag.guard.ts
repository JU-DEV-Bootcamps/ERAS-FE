import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { FeatureFlagsService } from '@core/components/feature-flags/feature-flags.service';

export function featureFlagGuard(flag: string): CanActivateFn {
  return () => {
    const featureFlagsService = inject(FeatureFlagsService);
    const router = inject(Router);

    if (featureFlagsService.isEnabled(flag)) {
      return true;
    }

    return router.createUrlTree(['/home']);
  };
}
