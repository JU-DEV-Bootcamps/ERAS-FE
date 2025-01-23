import { inject } from '@angular/core';
import { CanActivateChildFn, Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { UserStore } from '../store/user.store';
import { KeycloakService } from '../../core/services/keycloak.service';

export const authGuard: CanActivateChildFn = (childRoute, state) => {
  const cookieService = inject(CookieService);
  const router = inject(Router);
  const userStore = inject(UserStore);
  const keycloak = inject(KeycloakService);
  const user = cookieService.get('user');
  if (!user && !keycloak.userId && state.url !== '/login') {
    router.navigate(['login']);
    return false;
  }

  if (user && !userStore.user()) {
    userStore.login(JSON.parse(user));
  }

  return true;
};
