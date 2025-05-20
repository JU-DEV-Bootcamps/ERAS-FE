import { Component, inject } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { MatMenu } from '@angular/material/menu';
import { MatToolbar } from '@angular/material/toolbar';
import { Router } from '@angular/router';
import Keycloak from 'keycloak-js';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
  imports: [MatIcon, MatToolbar, MatMenu],
})
export class NavbarComponent {
  user?: { name: string; email: string };
  authenticated = false;
  keycloakStatus: string | undefined;
  private readonly keycloak = inject(Keycloak);
  router = inject(Router);

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

  toggleSidenav() {
    const sidenav = document.querySelector('.sidenav') as HTMLElement;
    if (sidenav) {
      sidenav.classList.toggle('open');
    }
  }
}
