import { inject, Injectable } from '@angular/core';
import Keycloak from 'keycloak-js';
import { environment } from '../../../environments/environment';
import { UserStore } from '../../shared/store/user.store';

interface otherAttrTokenParse {
  email: string,
  firstName: string,
  lastName: string
};

@Injectable({
    providedIn: 'root'
  })
export class KeycloakService {
  private _keycloak: Keycloak | undefined;
  public authenticated: boolean;
  userStore = inject(UserStore);

  constructor() { this.authenticated = false; }

  get keycloak(): Keycloak {
    if(!this._keycloak) {
        this._keycloak = new Keycloak({
            url: environment.keycloak.url,
            realm: environment.keycloak.realm,
            clientId: environment.keycloak.clientId
        })
    }
    return this._keycloak;
  }

  async init() {
    this.authenticated = await this.keycloak.init({
        onLoad: 'login-required'
    });
  }
  async login() {
    await this.keycloak.login();
    console.log("Keycloak login", this.keycloak);
  }

  get userId() {
    return this.keycloak?.tokenParsed?.sub as string;
  }

  get isTokenValid() {
    return !this.keycloak.isTokenExpired();
  }

  get fullName() {
    return this.keycloak.tokenParsed?.['name'] as string;
  }

  async logout() {
    return await this.keycloak.logout({ redirectUri: environment.keycloak.redirectUri });
  }

  logToUserStore(){
    const userProfile = this.keycloak.tokenParsed as otherAttrTokenParse;
    this.userStore.login({
        id: this.keycloak.clientId || '',
        email:  userProfile.email || "No email found",
        name: userProfile.firstName,
        photoUrl: "",
        firstName: userProfile.firstName || "given_name",
        lastName: userProfile.lastName || "family_name",
        authToken: this.keycloak.authServerUrl || "No token found",
        idToken: this.keycloak.idToken || "No token found",
        authorizationCode: this.keycloak.token || "No token found",
    });
  }
  accountManagement() {
    return this.keycloak.accountManagement();
  }
}
