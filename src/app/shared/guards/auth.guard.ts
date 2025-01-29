import { inject } from '@angular/core';
import { CanActivateChildFn, Router } from '@angular/router';
import { UserStore } from '../store/user.store';
import { KeycloakService } from '../../core/services/keycloak.service';

export const authGuard: CanActivateChildFn = (childRoute, state) => {
  const router = inject(Router);
  const userStore = inject(UserStore);
  const keycloak = inject(KeycloakService);
  if (!keycloak.userId && state.url !== '/login') {
    router.navigate(['login']);
    return false;
  }

  if (!userStore.user()) {
    keycloak.logToUserStore();
  }

  return true;
};
