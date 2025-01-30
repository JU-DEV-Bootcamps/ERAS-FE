import { inject } from '@angular/core';
import { CanActivateChildFn, Router } from '@angular/router';
import { KeycloakService } from '../../core/services/keycloak.service';

export const authGuard: CanActivateChildFn = (childRoute, state) => {
  const router = inject(Router);
  const keycloak = inject(KeycloakService);
  if (!keycloak.authenticated && state.url !== '/login') {
    router.navigate(['login']);
    return false;
  }
  if(state.url === '/login'){
    router.navigate(['profile']);
  }
  return true;
};
