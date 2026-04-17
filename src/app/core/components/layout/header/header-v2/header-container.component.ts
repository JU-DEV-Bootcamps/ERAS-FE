import { Component, inject } from '@angular/core';
import { FEATURE_FLAGS } from '@core/components/feature-flags/feature-flags';
import { FeatureFlagsService } from '@core/components/feature-flags/feature-flags.service';
import { HeaderComponent } from '../header/header.component';
import { HeaderV2Component } from './header-v2.component';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map, startWith } from 'rxjs';
import { AppRouteData } from '@core/models/route-data.model';

@Component({
  selector: 'app-header-container',
  imports: [HeaderComponent, HeaderV2Component],
  template: `
    @if (showV2) {
      <app-header-v2 [sectionTitle]="headerTitle()"></app-header-v2>
    } @else {
      <app-header></app-header>
    }
  `,
})
export class HeaderContainerComponent {
  private readonly featureFlags = inject(FeatureFlagsService);
  private readonly router = inject(Router);
  //Later, it will need to see V2 in queryparams, currently it is only for home screen v2
  showV2 = this.featureFlags.isEnabled(FEATURE_FLAGS.home);

  headerTitle = toSignal(
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      startWith(null),
      map(() => {
        const route = this.getDeepestChild(this.router.routerState.root);
        return (route?.snapshot?.data as AppRouteData)?.headerTitle ?? null;
      })
    )
  );

  private getDeepestChild(route: ActivatedRoute): ActivatedRoute {
    while (route.firstChild) route = route.firstChild;
    return route ?? null;
  }
}
