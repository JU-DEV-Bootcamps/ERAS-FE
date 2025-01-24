import { UserState } from '../../core/interfaces/user-state';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { inject } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';

export const initialState: UserState = {
  user: null,
  isLoggedIn: false,
  token: null,
};

export const UserStore = signalStore(
  { providedIn: 'root' },
  withState<UserState>(initialState),
  withMethods(
    (
      store,
      cookieService = inject(CookieService)
    ) => ({
      login(newUser: UserState['user']) {
        patchState(store, {
          user: newUser,
          isLoggedIn: true,
        });
        cookieService.set('user', JSON.stringify(newUser), {
            expires: 1,
            path: '/',
            sameSite: 'Strict', //Protects against CSRF
            //secure: true, // Send cookies over HTTPS
        });
      },
      logout() {
        patchState(store, { user: null, isLoggedIn: false });
        cookieService.delete('user');
      },
    })
  )
);
