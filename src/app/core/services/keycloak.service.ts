import { Injectable } from '@angular/core';
import Keycloak from 'keycloak-js';
import { environment } from '../../../environments/environment';
@Injectable({
  providedIn: 'root'
})
export class KeycloakService {
  private _keycloak: Keycloak | undefined;

  constructor() { }

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
    const authenticated = await this.keycloak.init({
        onLoad: 'login-required'
    });
  }
  async login() {
    await this.keycloak.login();
  }

  get userId() {
    return this.keycloak?.tokenParsed?.sub as string;
  }

  get isTokenValik() {
    return !this.keycloak.isTokenExpired();
  }

  get fullName() {
    return this.keycloak.tokenParsed?.['name'] as string;
  }

  logout() {
    return this.keycloak.login({ redirectUri: 'http://localhost:4200' });
  }

  accountManagement() {
    return this.keycloak.accountManagement();
  }
}
