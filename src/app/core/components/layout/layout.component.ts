import {
  Component,
  computed,
  effect,
  inject,
  OnInit,
  model,
  signal,
  untracked,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, RouterOutlet, Router } from '@angular/router';
import { filter } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatRadioModule } from '@angular/material/radio';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';

import {
  BreakpointObserver,
  BreakpointState,
  Breakpoints,
} from '@angular/cdk/layout';
import { SidebarComponent } from '@core/components/sidebar/sidebar.component';
import { HeaderContainerComponent } from './header/header-v2/header-container.component';
import { FeatureFlagsService } from '@core/components/feature-flags/feature-flags.service';
import { FEATURE_FLAGS } from '@core/components/feature-flags/feature-flags';
import { ViewportService } from '@core/services/layout/viewport.service';
import { ToastNotificationComponent } from '@shared/components/toast-notification/toast-notification.component';

enum Sidenav {
  shrink = '70px',
  expand = '250px',
  newExpand = '260px',
}

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    CommonModule,
    MatSidenavModule,
    MatToolbarModule,
    RouterOutlet,
    MatButtonModule,
    MatRadioModule,
    FormsModule,
    ReactiveFormsModule,
    MatIconModule,
    MatMenuModule,
    SidebarComponent,
    HeaderContainerComponent,
    ToastNotificationComponent,
  ],
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss'],
})
export class LayoutComponent implements OnInit {
  private breakpointObserver = inject(BreakpointObserver);
  private router = inject(Router);
  private featureFlagsService = inject(FeatureFlagsService);
  readonly isMobile = inject(ViewportService).isMobile;

  collapsed = model<boolean>(false);
  menuOpen = signal(false);
  newSidebar = computed(() =>
    this.featureFlagsService.isEnabled(FEATURE_FLAGS.newSidebar)
  );
  reportsV2 = computed(() =>
    this.featureFlagsService.isEnabled(FEATURE_FLAGS.reportsV2)
  );
  home = computed(() => this.featureFlagsService.isEnabled(FEATURE_FLAGS.home));
  dynamicCharts = computed(() =>
    this.featureFlagsService.isEnabled(FEATURE_FLAGS.dynamicCharts)
  );

  sidenavWidth = computed(() => {
    if (this.newSidebar()) {
      return Sidenav.newExpand;
    }
    if (this.isMobile()) {
      return Sidenav.expand;
    }
    return this.collapsed() ? Sidenav.shrink : Sidenav.expand;
  });

  contentMargin = computed(() => (this.isMobile() ? '0' : this.sidenavWidth()));

  constructor() {
    effect(() => {
      this.isMobile();
      untracked(() => this.menuOpen.set(false));
    });
    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        takeUntilDestroyed()
      )
      .subscribe(() => this.menuOpen.set(false));
  }

  ngOnInit() {
    this.breakpointObserver
      .observe([Breakpoints.Small, '(max-width: 1200px)'])
      .subscribe((state: BreakpointState) => this.collapsed.set(state.matches));
  }
}
