import { computed, inject, Injectable, signal } from '@angular/core';
import { Profile } from '@core/models/profile.model';
import keycloak from 'keycloak-js';

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

    const profile = await this.keycloak.loadUserProfile();
    this.saveToSession(profile as Profile);
  }

  private saveToSession({ firstName, id }: Profile) {
    const sessionProfile: Profile = { firstName, id };
    sessionStorage.setItem(this.STORAGE_KEY, JSON.stringify(sessionProfile));
    this._user.set(sessionProfile);
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
