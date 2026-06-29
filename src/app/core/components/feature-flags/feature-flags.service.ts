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

/**
 * Service responsible for evaluating feature flags based on URL query parameters.
 *
 * Behavior:
 * 1.In production, feature flags are restricted and cannot be arbitrarily enabled.
 * 2.In non-production environments, feature flags can be toggled via query params
 *   for testing and validation purposes.
 *
 * Example:
 *   ?newSection=true or ?newSection=false.
 */

@Injectable({ providedIn: 'root' })
export class FeatureFlagsService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly baseUrl = environment.apiUrl + '/api/v1/feature-flags';

  private _flags = signal<Record<string, boolean>>({});
  flags = computed(() => this._flags());

  private _flagMeta = signal<FeatureFlag[]>([]);

  loadFlags(): Observable<void> {
    return this.http.get<FeatureFlag[]>(this.baseUrl).pipe(
      tap(flags => {
        console.log('flags from API:', flags);
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
