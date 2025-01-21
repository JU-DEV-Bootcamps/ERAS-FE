import { UserState } from '../../core/interfaces/user-state';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { Router } from '@angular/router';
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
      router = inject(Router),
      cookieService = inject(CookieService)
    ) => ({
      login(newUser: UserState['user']) {
        patchState(store, {
          user: newUser,
          isLoggedIn: true,
        });

        cookieService.set('user', JSON.stringify(newUser));
      },
      logout() {
        patchState(store, { user: null, isLoggedIn: false });
        cookieService.delete('user');
        router.navigate(['login']);
      },
    })
  )
);


