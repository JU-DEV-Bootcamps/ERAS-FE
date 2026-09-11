import { computed, inject, Injectable } from '@angular/core';
import { UserDataService } from '@core/services/access/user-data.service';
import { RoleFetchStrategyMap } from './role-based-fetch.types';
import { Observable, throwError } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class RoleBasedFetchResolver {
  private userDataService = inject(UserDataService);
  private user = computed(() => this.userDataService.user());

  resolve<TService, TResult>(
    service: TService,
    strategies: RoleFetchStrategyMap<TService, TResult>
  ): Observable<TResult> {
    const currentUser = this.user();

    if (!currentUser)
      return throwError(() => new Error('User is not authenticated.'));

    const role = currentUser.role;
    if (!role)
      return throwError(() => new Error('User does not have a role assigned.'));

    const strategy = strategies[role];

    return strategy(service, { currentUserId: currentUser.id ?? '' });
  }
}
