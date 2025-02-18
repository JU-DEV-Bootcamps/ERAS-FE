import { inject } from '@angular/core';
import { CanActivateChildFn, Router } from '@angular/router';
import Keycloak from 'keycloak-js';

export const authGuard: CanActivateChildFn = () => {
  const router = inject(Router);
  const keycloak = inject(Keycloak);
  const isUserLoggedIn = keycloak.authenticated; // Replace with actual logic to check if user is logged in
  if (!isUserLoggedIn) {
    router.navigate(['/login']);
    return false;
  }
  router.navigate(['/']);
  return true;
};
