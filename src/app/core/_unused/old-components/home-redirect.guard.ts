import { CanActivateFn, Router } from '@angular/router';
import { FEATURE_FLAGS } from '../../components/feature-flags/feature-flags';
import { FeatureFlagsService } from '../../components/feature-flags/feature-flags.service';
import { inject } from '@angular/core';

export const homeRedirectGuard: CanActivateFn = () => {
  const featureFlags = inject(FeatureFlagsService);
  const router = inject(Router);

  const isV2 = featureFlags.isEnabled(FEATURE_FLAGS.home);

  return router.createUrlTree([isV2 ? '/home' : '/home-v1']);
};
