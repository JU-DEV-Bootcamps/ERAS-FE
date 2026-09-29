import { computed, inject, Injectable, signal } from '@angular/core';
import { isErasRole, Profile } from '@core/models/profile.model';
import keycloak, { KeycloakProfile } from 'keycloak-js';

@Injectable({
  providedIn: 'root',
})
export class UserDataService {
  private readonly STORAGE_KEY: string = 'erasUserProfile';
  private _user = signal<Profile | null>(null);
  user = computed(() => this._user());

  private readonly keycloak = inject(keycloak);

  constructor() {
    this.loadFromSession();
  }

  async initUser(): Promise<void> {
    if (this._user()) return;

    const keycloakProfile = await this.keycloak.loadUserProfile();
    const profile = this.mapToProfileModel(keycloakProfile);
    this.saveToSession(profile);
  }

  private mapToProfileModel(userProfile: KeycloakProfile): Profile {
    const userRole = this.keycloak.realmAccess?.roles.find(role =>
      isErasRole(role)
    );
    return {
      firstName: userProfile.firstName,
      id: userProfile.id,
      lastName: userProfile.lastName,
      role: userRole ? userRole : 'User',
      fullName: userProfile.lastName
        ? `${userProfile.firstName} ${userProfile.lastName}`
        : userProfile.firstName,
    };
  }

  private saveToSession(profile: Profile) {
    sessionStorage.setItem(this.STORAGE_KEY, JSON.stringify(profile));
    this._user.set(profile);
  }

  private loadFromSession() {
    const userFromSession = sessionStorage.getItem(this.STORAGE_KEY);

    if (!userFromSession) return;

    try {
      const profile: Profile = JSON.parse(userFromSession);
      this._user.set(profile);
    } catch {
      sessionStorage.removeItem(this.STORAGE_KEY);
    }
  }

  clear() {
    sessionStorage.removeItem(this.STORAGE_KEY);
    this._user.set(null);
  }
}
