import { inject, Injectable, Signal } from '@angular/core';
import { ErasRole, Profile } from '@core/models/profile.model';
import { UserDataService } from '@core/services/access/user-data.service';
import { FEATURE_FLAGS } from './feature-flags';
import { FeatureFlagsName } from './feature-flags.model';

/**
 * Service responsible for evaluating feature flags.
 * Use the `isEnabled()` method to evaluate a flag.
 *
 */
@Injectable({ providedIn: 'root' })
export class FeatureFlagsService {
  private readonly userDataService = inject(UserDataService);

  private _user: Signal<Profile | null> = this.userDataService.user;
  private _featureFlags = FEATURE_FLAGS;

  isEnabled(flagName: FeatureFlagsName): boolean {
    const flagRules = this._featureFlags[flagName];

    if (!flagRules.enabled) {
      return false;
    }

    const userRole = this._user()?.role;
    if (flagRules.userRoles) {
      return this.userHasAllowedRole(flagRules.userRoles, userRole);
    }

    return true;
  }

  private userHasAllowedRole(
    allowedRoles: ErasRole[],
    userRole?: ErasRole
  ): boolean {
    if (!userRole) {
      return false;
    }

    return allowedRoles.includes(userRole);
  }
}
