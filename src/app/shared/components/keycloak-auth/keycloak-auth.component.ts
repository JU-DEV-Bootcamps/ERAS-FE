import { SocialUser } from '@abacritt/angularx-social-login';
import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserStore } from '../../store/user.store';
import { KeycloakService } from '../../../core/services/keycloak.service';

@Component({
  selector: 'app-keycloak-auth',
  imports: [],
  templateUrl: './keycloak-auth.component.html',
  styleUrl: './keycloak-auth.component.css'
})
export class KeycloakAuthComponent implements OnInit{
  user?: SocialUser;
  loggedIn?: boolean;
  router = inject(Router);
  userStore = inject(UserStore);

  constructor(private keycloakService: KeycloakService) {}

  ngOnInit(): void {
    if(this.keycloakService.isTokenValid){
        const userProfile = this.keycloakService.keycloak.tokenParsed as any;
        this.userStore.login({
            id: this.keycloakService.userId,
            email:  userProfile.email || "No email found",
            name: this.keycloakService.fullName,
            photoUrl: this.keycloakService.userId,
            firstName: userProfile.firstName || "given_name",
            lastName: userProfile.lastName || "family_name",
            authToken: this.keycloakService.keycloak.authServerUrl || "No token found",
            idToken: this.keycloakService.keycloak.idToken || "No token found",
            authorizationCode: this.keycloakService.keycloak.token || "No token found",
        })
        this.router.navigate(['profile']);
    }
  }
  async login(): Promise<void>{
    await this.keycloakService.init();
    this.ngOnInit();
    console.log("login with keycloak", this.keycloakService);
  }
}
