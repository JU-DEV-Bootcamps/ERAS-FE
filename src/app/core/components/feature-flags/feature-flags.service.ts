import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, tap, Observable, catchError, of } from 'rxjs';
import { Router } from '@angular/router';
import { FEATURE_FLAGS } from './feature-flags';
import { environment } from 'src/environments/environment';
import { UserDataService } from '@core/services/access/user-data.service';
import { ERASRoles } from '@core/models/profile.model';

interface FeatureFlag {
  id: number;
  name: string;
  isEnabled: boolean;
}

@Injectable({ providedIn: 'root' })
export class FeatureFlagsService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly userData = inject(UserDataService);
  private readonly baseUrl = environment.apiUrl + '/api/v1/feature-flags';

  private _flags = signal<Record<string, boolean>>({});
  flags = computed(() => this._flags());

  private _flagMeta = signal<FeatureFlag[]>([]);

  private readonly OVERRIDES_KEY = 'erasFeatureFlagOverrides';

  private currentUrlParams(): Record<string, string> {
    const fromWindow = Object.fromEntries(
      new URLSearchParams(window.location.search)
    );
    const fromRouter = this.router.routerState.root.snapshot.queryParams;
    return { ...fromWindow, ...fromRouter };
  }

  private readStoredOverrides(): Record<string, boolean> {
    try {
      return JSON.parse(sessionStorage.getItem(this.OVERRIDES_KEY) ?? '{}');
    } catch {
      return {};
    }
  }

  private captureOverrides(
    params: Record<string, string>,
    flag: string
  ): Record<string, boolean> {
    const overrides = this.readStoredOverrides();
    let changed = false;

    for (const key of new Set(['v2', flag, ...Object.values(FEATURE_FLAGS)])) {
      if (params[key] === 'true' && overrides[key] !== true) {
        overrides[key] = true;
        changed = true;
      } else if (params[key] === 'false' && key in overrides) {
        delete overrides[key];
        changed = true;
      }
    }

    if (changed) {
      try {
        sessionStorage.setItem(this.OVERRIDES_KEY, JSON.stringify(overrides));
      } catch (error) {
        console.warn('Could not persist feature flag overrides', error);
      }
    }
    return overrides;
  }

  private clearOverrides(): void {
    try {
      sessionStorage.removeItem(this.OVERRIDES_KEY);
    } catch (error) {
      console.warn('Could not clear feature flag overrides', error);
    }
  }

  private isAdminUser = computed(
    () => this.userData.user()?.role === ERASRoles.ADMIN
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
    const overrides = this.captureOverrides(this.currentUrlParams(), flag);

    if (overrides['v2'] || overrides[flag]) return true;

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
          this.clearOverrides();
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
