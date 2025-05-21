import { Component, inject } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { MatMenu, MatMenuTrigger } from '@angular/material/menu';
import { MatToolbar } from '@angular/material/toolbar';
import { Router } from '@angular/router';
import Keycloak from 'keycloak-js';

@Component({
  selector: 'app-user-menu',
  templateUrl: './user-menu.component.html',
  styleUrls: ['./user-menu.component.scss'],
  imports: [MatMenu, MatIcon, MatToolbar, MatMenuTrigger],
})
export class UserMenuComponent {
  user?: { name: string; email: string };
  authenticated = false;
  private readonly keycloak = inject(Keycloak);
  router = inject(Router);

  constructor() {
    this.user = {
      name: this.keycloak.clientId || 'NameNot Found',
      email: 'userInfo.email',
    };
  }

  manageKeycloakUser(): void {
    this.keycloak.accountManagement();
  }

  login() {
    this.keycloak.login();
  }

  logout() {
    this.keycloak.logout();
  }

  redirect(redirectTo: string) {
    this.router.navigate([redirectTo]);
  }
}
