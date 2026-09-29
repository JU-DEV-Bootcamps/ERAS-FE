import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { BaseApiService } from '@core/services/api/base-api.service';

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
}
