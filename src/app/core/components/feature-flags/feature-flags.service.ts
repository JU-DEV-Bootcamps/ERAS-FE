import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, tap, Observable, catchError, of } from 'rxjs';
import { Router } from '@angular/router';
import { FEATURE_FLAGS } from './feature-flags';
import { environment } from 'src/environments/environment';
import { UserDataService } from '@core/services/access/user-data.service';

interface FeatureFlag {
  id: number;
  name: string;
  isEnabled: boolean;
}

/**
 * Service responsible for evaluating feature flags.
 *
 * Behavior:
 * 1. Flags are controlled by the backend (toggle in the user menu, admin-only),
 *    but that value only applies to admin users.
 * 2. Non-admin users always default to v1, regardless of the backend value,
 *    unless overridden via query params (see below).
 * 3. Any user can force-enable v2 for their own session via `?v2=true`,
 *    or an individual flag via `?flagName=true`. This works for any role
 *    and takes precedence over both the backend value and the admin check.
 */

@Injectable({ providedIn: 'root' })
export class FeatureFlagsService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly userData = inject(UserDataService);
  private readonly baseUrl = environment.apiUrl + '/api/v1/feature-flags';

  private _flags = signal<Record<string, boolean>>({});
  flags = computed(() => this._flags());

  private _flagMeta = signal<FeatureFlag[]>([]);

  private queryParams = computed(() => {
    return this.router.routerState.root.snapshot.queryParams;
  });

  private isAdminUser = computed(
    () => this.userData.user()?.role === 'Eras Admin'
  );

  loadFlags(): Observable<void> {
    return this.http.get<FeatureFlag[]>(this.baseUrl).pipe(
      tap(flags => {
        this._flagMeta.set(flags);

        const v2Flag = flags.find(f => f.name === 'v2');
        const v2Enabled = v2Flag?.isEnabled ?? false;

        const mapped = Object.fromEntries(
          Object.values(FEATURE_FLAGS).map(f => [f, v2Enabled])
        );
        this._flags.set(mapped);
      }),
      map(() => void 0),
      catchError(err => {
        console.error('loadFlags failed:', err);
        return of(void 0);
      })
    );
  }

  isEnabled(flag: string): boolean {
    const params = this.queryParams();

    if (params['v2'] === 'true') return true;
    if (params[flag] === 'true') return true;

    if (!this.isAdminUser()) return false;

    return this._flags()[flag] ?? false;
  }

  toggle(flagName: string, enabled: boolean): Observable<void> {
    const flag = this._flagMeta().find(f => f.name === flagName);
    if (!flag) {
      console.warn(
        `Flag '${flagName}' not found in meta. Meta:`,
        this._flagMeta()
      );
      return of(void 0);
    }

    return this.http
      .put<void>(`${this.baseUrl}/${flag.id}`, { ...flag, isEnabled: enabled })
      .pipe(
        tap(() => {
          const mapped = Object.fromEntries(
            Object.values(FEATURE_FLAGS).map(f => [f, enabled])
          );
          this._flags.set(mapped);
        }),
        catchError(err => {
          console.error('Toggle failed:', err);
          return of(void 0);
        })
      );
  }

  enableLocal(flag: string): void {
    this._flags.update(f => ({ ...f, [flag]: true }));
  }

  disableLocal(flag: string): void {
    this._flags.update(f => ({ ...f, [flag]: false }));
  }
}
