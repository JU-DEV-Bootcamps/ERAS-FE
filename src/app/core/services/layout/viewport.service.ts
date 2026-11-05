import { BreakpointObserver } from '@angular/cdk/layout';
import { Injectable, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';

export const MOBILE_MEDIA_QUERY = '(max-width: 767.98px)';

/** Tells components whether the screen is narrower than 768px. */
@Injectable({ providedIn: 'root' })
export class ViewportService {
  private readonly breakpointObserver = inject(BreakpointObserver);

  readonly isMobile = toSignal(
    this.breakpointObserver
      .observe(MOBILE_MEDIA_QUERY)
      .pipe(map(state => state.matches)),
    { initialValue: this.breakpointObserver.isMatched(MOBILE_MEDIA_QUERY) }
  );
}
