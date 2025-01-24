import { Injectable } from '@angular/core';
import Keycloak from 'keycloak-js';
import { environment } from '../../../environments/environment';
@Injectable({
  providedIn: 'root'
})
export class KeycloakService {
  private _keycloak: Keycloak | undefined;
  public authenticated: boolean;

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

  accountManagement() {
    return this.keycloak.accountManagement();
  }
}
