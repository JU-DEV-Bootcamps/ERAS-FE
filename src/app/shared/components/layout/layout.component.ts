import { Component, effect, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatRadioModule } from '@angular/material/radio';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatMenuModule } from '@angular/material/menu';
import { CommonModule } from '@angular/common';
import Keycloak from 'keycloak-js';
import {
  KEYCLOAK_EVENT_SIGNAL,
  KeycloakEventType,
  typeEventArgs,
  ReadyArgs,
} from 'keycloak-angular';

@Component({
  selector: 'app-layout',
  imports: [
    RouterOutlet,
    CommonModule,
    MatSidenavModule,
    MatButtonModule,
    MatRadioModule,
    FormsModule,
    ReactiveFormsModule,
    MatIconModule,
    MatToolbarModule,
    MatMenuModule,
  ],
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss'],
})
export class LayoutComponent {
  user?: { name: string; email: string };
  authenticated = false;
  keycloakStatus: string | undefined;
  private readonly keycloak = inject(Keycloak);
  private readonly keycloakSignal = inject(KEYCLOAK_EVENT_SIGNAL);
  isSettingsExpanded = false;
  isImportsExpanded = false;
  isListsExpanded = false;

  router = inject(Router);
  constructor() {
    this.user = {
      name: "this.keycloak.fullName || 'NameNot Found'",
      email: 'userInfo.email',
    };

    effect(() => {
      const keycloakEvent = this.keycloakSignal();

      this.keycloakStatus = keycloakEvent.type;

      if (keycloakEvent.type === KeycloakEventType.Ready) {
        this.authenticated = typeEventArgs<ReadyArgs>(keycloakEvent.args);
      }

      if (keycloakEvent.type === KeycloakEventType.AuthLogout) {
        this.authenticated = false;
      }
    });
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

  redirectCLStatus() {
    this.router.navigate(['cosmic-latte']);
  }
  redirectProfile() {
    this.router.navigate(['']);
  }
  redirectImportAnswers() {
    this.router.navigate(['import-answers']);
  }
  redirectReports() {
    this.router.navigate(['heat-map']);
  }
  redirectImportStudents() {
    this.router.navigate(['import-students']);
  }
  toggleSettings(expand: boolean) {
    this.isSettingsExpanded = expand;
  }
  toggleImports(expand: boolean) {
    this.isImportsExpanded = expand;
  }
  toggleLists(expand: boolean) {
    this.isListsExpanded = expand;
  }
}
