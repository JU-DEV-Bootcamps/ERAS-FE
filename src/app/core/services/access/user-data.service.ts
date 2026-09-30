import { computed, inject, Injectable, signal } from '@angular/core';
import { ERASRoles, Profile } from '@core/models/profile.model';
import { UsersService } from '@core/services/api/users.service';
import keycloak, { KeycloakProfile } from 'keycloak-js';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class UserDataService {
  private readonly STORAGE_KEY: string = 'erasUserProfile';
  private _user = signal<Profile | null>(null);
  user = computed(() => this._user());

  private readonly keycloak = inject(keycloak);
  private readonly usersService = inject(UsersService);

  constructor() {
    this.loadFromSession();
  }

  async initUser(): Promise<void> {
    if (this._user()) return;

    const keycloakProfile = await this.keycloak.loadUserProfile();
    const profile = this.mapToProfileModel(keycloakProfile);
    this.saveToSession(profile);
    this.syncWithBackend();
  }

  private syncWithBackend(): void {
    this.usersService.sync().subscribe({
      error: (error: unknown) =>
        console.error('Failed to sync ERAS user profile with backend', error),
    });
  }

  private getUserRole(): ERASRoles {
    const { clientId } = environment.keycloak;
    const { administrator, officer, professional } = environment.roleNames;
    const resourceAccess = this.keycloak.resourceAccess;
    const userRoles = resourceAccess
      ? resourceAccess[clientId]?.roles
      : undefined;

    if (!userRoles) return ERASRoles.GUEST;

    if (userRoles.includes(administrator)) return ERASRoles.ADMIN;
    if (userRoles.includes(officer)) return ERASRoles.OFFICER;
    if (userRoles.includes(professional)) return ERASRoles.PROFESSIONAL;

    return ERASRoles.GUEST;
  }

  private mapToProfileModel(userProfile: KeycloakProfile): Profile {
    return {
      firstName: userProfile.firstName,
      id: userProfile.id,
      lastName: userProfile.lastName,
      role: this.getUserRole(),
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
