import { HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { BaseApiService } from '@core/services/api/base-api.service';

/** Mirrors the backend's `ErasUserDTO` — a real Keycloak-synced ERAS account. */
export interface ErasUserProfile {
  sub: string | null;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

@Injectable({
  providedIn: 'root',
})
export class UsersService extends BaseApiService {
  protected resource = 'users';

  /**
   * Upserts the current identity's ERAS user profile from its Keycloak claims.
   * Needed because the app authenticates directly against Keycloak (not through
   * the backend's own /auth/login), so the backend never otherwise sees this login
   * to register/sync the local `eras_users` record.
   */
  sync(): Observable<unknown> {
    return this.post('sync', {});
  }

  /**
   * Lists real ERAS users, optionally filtered by role (e.g. to populate an "assigned
   * professional" picker with actual accounts instead of a disconnected name catalog,
   * or — with no role — to resolve any user's sub back to a display name).
   */
  getByRole(role?: string): Observable<ErasUserProfile[]> {
    const params = role ? new HttpParams().set('role', role) : new HttpParams();
    return this.get<ErasUserProfile[]>('', params);
  }
}
