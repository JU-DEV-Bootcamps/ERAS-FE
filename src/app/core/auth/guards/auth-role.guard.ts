import { AuthGuardData, createAuthGuard } from 'keycloak-angular';
import {
  ActivatedRouteSnapshot,
  CanActivateFn,
  Router,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { inject } from '@angular/core';
import { ERASRoles } from '@core/models/profile.model';
import { environment } from 'src/environments/environment';

/**
 * Validates whether user has the required roles to access
 * the provided route.
 * @param route route to validate.
 * @param __ route state.
 * @param authData snapshot of auth data from Keycloak.
 * @returns { Promise<boolean | UrlTree> }
 */
const isAccessAllowed = async (
  route: ActivatedRouteSnapshot,
  __: RouterStateSnapshot,
  authData: AuthGuardData
): Promise<boolean | UrlTree> => {
  const { authenticated, grantedRoles } = authData;
  const { clientId } = environment.keycloak;

  const requiredRoles = route.data['roles'] as ERASRoles[] | undefined;
  if (!requiredRoles) {
    return true;
  }

  const hasRequiredRole = (roles: ERASRoles[]): boolean => {
    const userRoles: string[] | undefined =
      grantedRoles.resourceRoles[clientId];

    if (!userRoles) return false;

    const { administrator, officer, professional } = environment.roleNames;

    if (userRoles.includes(administrator)) return true;

    const resolvedRoles: ERASRoles[] = [];
    if (userRoles.includes(officer)) resolvedRoles.push(ERASRoles.OFFICER);
    if (userRoles.includes(professional))
      resolvedRoles.push(ERASRoles.PROFESSIONAL);

    return resolvedRoles.some(role => roles.includes(role));
  };

  if (authenticated && hasRequiredRole(requiredRoles)) {
    return true;
  }

  const router = inject(Router);
  return router.parseUrl('/home');
};

export const canActivateAuthRole =
  createAuthGuard<CanActivateFn>(isAccessAllowed);
