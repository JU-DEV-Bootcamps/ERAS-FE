import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, tap, Observable, catchError, of } from 'rxjs';
import { Router } from '@angular/router';
import { FEATURE_FLAGS } from './feature-flags';
import { environment } from 'src/environments/environment';

interface FeatureFlag {
  id: number;
  name: string;
  isEnabled: boolean;
}

const flagsSetTo = (Enabled: boolean): Record<string, boolean> =>
  Object.fromEntries(Object.values(FEATURE_FLAGS).map(Flag => [Flag, Enabled]));

@Injectable({ providedIn: 'root' })
export class FeatureFlagsService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly baseUrl = environment.apiUrl + '/api/v1/feature-flags';

  private _flags = signal<Record<string, boolean>>(flagsSetTo(true));
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
    const before = JSON.stringify(overrides);

    this.captureVersionOverride(params, overrides);

    const flagKeys = new Set([flag, ...Object.values(FEATURE_FLAGS)]);
    for (const key of flagKeys) {
      if (key === 'v1' || key === 'v2') continue;
      if (params[key] === 'true') {
        overrides[key] = true;
      } else if (params[key] === 'false') {
        delete overrides[key];
      }
    }

    const changed = JSON.stringify(overrides) !== before;

    if (changed) {
      try {
        sessionStorage.setItem(this.OVERRIDES_KEY, JSON.stringify(overrides));
      } catch (error) {
        console.warn('Could not persist feature flag overrides', error);
      }
    }
    return overrides;
  }

  private captureVersionOverride(
    params: Record<string, string>,
    overrides: Record<string, boolean>
  ): void {
    if (params['v1'] === 'true' || params['v2'] === 'false') {
      overrides['v1'] = true;
      delete overrides['v2'];
    }
    if (params['v2'] === 'true') {
      overrides['v2'] = true;
      delete overrides['v1'];
    }
    if (params['v1'] === 'false') {
      delete overrides['v1'];
    }
  }

  private clearOverrides(): void {
    try {
      sessionStorage.removeItem(this.OVERRIDES_KEY);
    } catch (error) {
      console.warn('Could not clear feature flag overrides', error);
    }
  }

  loadFlags(): Observable<void> {
    return this.http.get<FeatureFlag[]>(this.baseUrl).pipe(
      tap(flags => {
        this._flagMeta.set(flags);

        const v2Flag = flags.find(f => f.name === 'v2');
        const v2Enabled = v2Flag?.isEnabled ?? true;

        this._flags.set(flagsSetTo(v2Enabled));
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

    if (overrides[flag]) return true;
    if (overrides['v1'] && Object.values(FEATURE_FLAGS).includes(flag)) {
      return false;
    }
    if (overrides['v2']) return true;

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
          this._flags.set(flagsSetTo(enabled));
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
