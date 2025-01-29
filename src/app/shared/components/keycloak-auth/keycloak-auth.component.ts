import { SocialUser } from '@abacritt/angularx-social-login';
import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserStore } from '../../store/user.store';
import { KeycloakService } from '../../../core/services/keycloak.service';

interface otherAttrTokenParse {
  email: string,
  firstName: string,
  lastName: string
};


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
    console.info("ngOnInit KeycloakAuthComponent", this.keycloakService);
    if(this.keycloakService.isTokenValid){
        const userProfile = this.keycloakService.keycloak.tokenParsed as otherAttrTokenParse;
        this.userStore.login({
            id: this.keycloakService.userId,
            email:  userProfile.email || "No email found",
            name: this.keycloakService.fullName,
            photoUrl: '',
            firstName: userProfile.firstName || "given_name",
            lastName: userProfile.lastName || "family_name",
            authToken: this.keycloakService.keycloak.authServerUrl || "No token found",
            idToken: this.keycloakService.keycloak.idToken || "No token found",
            authorizationCode: this.keycloakService.keycloak.token || "No token found",
        });
    }
  }
  async login(): Promise<void>{
    try {
        await this.keycloakService.init();
    } catch (error) {
        console.error("Error on keycloak init", error);
    }
    try {
        this.ngOnInit();
    } catch (error) {
        console.error("Something went wrong with ngOnInit for KeycloakAuthComponent", error);
    }
    this.router.navigate(['profile']);
  }
}
