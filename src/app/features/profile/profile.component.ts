import { Component, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import Keycloak from 'keycloak-js';

@Component({
  selector: 'app-profile',
  imports: [MatCardModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css',
})
export class ProfileComponent implements OnInit {
  user: { name: string; email?: string; username?: string } | undefined;

  constructor(private readonly keycloak: Keycloak) {}

  async ngOnInit() {
    if (this.keycloak?.authenticated) {
      const profile = await this.keycloak.loadUserProfile();

      this.user = {
        name: `${profile?.firstName} ${profile.lastName}`,
        email: profile?.email,
        username: profile?.username,
      };
    }
  }

  manageKeycloakUser(): void {
    this.keycloak.accountManagement();
  }
}
