import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatRadioModule } from '@angular/material/radio';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatMenuModule } from '@angular/material/menu';
import { UserStore } from '../../store/user.store';
import { GoogleAuthService } from '../../../core/services/google-auth.service';
import { KeycloakService } from '../../../core/services/keycloak.service';

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
  userStore = inject(UserStore);
  googleService = inject(GoogleAuthService);
  keycloakService = inject(KeycloakService);
  user?: { name: string; email: string; photoUrl: string };

  ngOnInit(): void {
    const user = this.userStore.user();
    if (user) {
      this.user = user;
    }
  }

  router = inject(Router);
  async logout() {
    this.userStore.logout();
    try {
      await this.googleService.logout();
      await this.keycloakService.logout();
    } catch (error) {
      console.log("Only one provider logged at a time", error);
    }
    this.router.navigate(['login']);
  }
  redirectSettings() {
    this.router.navigate(['cosmic-latte']);
  }
  redirectProfile() {
    this.router.navigate(['profile']);
  }
  redirectReports() {
    this.router.navigate(['heat-map']);
  }
}
