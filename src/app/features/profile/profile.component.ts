import { Component, inject, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { KeycloakService, OtherAttrTokenParse } from '../../core/services/keycloak.service';

@Component({
  selector: 'app-profile',
  imports: [MatCardModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css',
})
export class ProfileComponent implements OnInit {
  user?: { name: string; email: string; } = {
    name: '',
    email: '',
  };

  keycloak = inject(KeycloakService);

  ngOnInit(): void {
    const userInfo = this.keycloak.keycloak.tokenParsed as OtherAttrTokenParse;
    if(this.keycloak.authenticated){
        this.user = {
            name: this.keycloak.fullName || "NameNot Found",
            email: userInfo.email,
        };
    }
  }

  manageKeycloakUser(): void {
    this.keycloak.accountManagement();
  }
}
