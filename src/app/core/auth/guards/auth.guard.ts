import { inject } from '@angular/core';
import { CanActivateChildFn } from '@angular/router';
import { AuthService } from '@core/services/access/access.service';

export const authGuard: CanActivateChildFn = async () => {
  const authService = inject(AuthService);

  if (!authService.isAuthenticated()) {
    await authService.login();
  }

  return authService.isAuthenticated();
};
