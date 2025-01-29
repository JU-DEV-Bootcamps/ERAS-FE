import { UserState } from '../../core/interfaces/user-state';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';

export const initialState: UserState = {
  user: null,
  isLoggedIn: false,
  token: null,
};

export const UserStore = signalStore(
  { providedIn: 'root' },
  withState<UserState>(initialState),
  withMethods((store) => ({
    login(newUser: UserState['user']) {
        patchState(store, {
          user: newUser,
          isLoggedIn: true,
        });
    },
    logout() {
        patchState(store, { user: null, isLoggedIn: false });
      },
    })
  )
);
