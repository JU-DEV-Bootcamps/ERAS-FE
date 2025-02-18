import { inject } from '@angular/core';
import { CanActivateChildFn } from '@angular/router';
import Keycloak from 'keycloak-js';

export const authGuard: CanActivateChildFn = () => {
  const keycloak = inject(Keycloak);
  return !!keycloak.authenticated; // Replace with actual logic to check if user is logged in
};
