import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatRadioModule } from '@angular/material/radio';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatMenuModule } from '@angular/material/menu';
import {
  KeycloakService,
  OtherAttrTokenParse,
} from '../../../core/services/keycloak.service';

@Component({
  selector: 'app-layout',
  imports: [
    RouterOutlet,
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
  styleUrl: './layout.component.scss',
})
export class LayoutComponent implements OnInit {
  keycloak = inject(KeycloakService);
  user?: { name: string; email: string };

  ngOnInit(): void {
    if (this.keycloak.authenticated) {
      const userInfo = this.keycloak.keycloak
        .tokenParsed as OtherAttrTokenParse;
      this.user = {
        name: this.keycloak.fullName || 'NameNot Found',
        email: userInfo.email,
      };
    }
  }

  router = inject(Router);
  async logout() {
    try {
      await this.keycloak.logout();
    } catch (error) {
      console.error('Keycloak logout error', error);
    }
  }
  redirectSettings() {
    this.router.navigate(['cosmic-latte']);
  }
  redirectProfile() {
    this.router.navigate(['profile']);
  }
  redirectImportAnswers() {
    this.router.navigate(['import-answers']);
  }
  redirectReports() {
    this.router.navigate(['heat-map']);
  }
  redirectImports() {
    this.router.navigate(['import-students']);
  }
}
