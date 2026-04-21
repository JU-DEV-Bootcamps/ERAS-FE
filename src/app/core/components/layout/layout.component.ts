import {
  Component,
  computed,
  inject,
  OnInit,
  model,
  signal,
} from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
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
  ],
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss'],
})
export class LayoutComponent implements OnInit {
  private breakpointObserver = inject(BreakpointObserver);
  private router = inject(Router);
  private featureFlagsService = inject(FeatureFlagsService);

  collapsed = model<boolean>(false);
  newSidebar = signal<boolean>(false);
  reportsV2 = signal<boolean>(false);

  sidenavWidth = computed(() => {
    if (this.newSidebar()) {
      return Sidenav.newExpand;
    }
    return this.collapsed() ? Sidenav.shrink : Sidenav.expand;
  });

  ngOnInit() {
    this.readSidebarFlag();

    this.breakpointObserver
      .observe([Breakpoints.Small, '(max-width: 1200px)'])
      .subscribe((state: BreakpointState) => this.collapsed.set(state.matches));
  }

  private readSidebarFlag(): void {
    this.newSidebar.set(
      this.featureFlagsService.isEnabled(FEATURE_FLAGS.newSidebar)
    );
    this.reportsV2.set(
      this.featureFlagsService.isEnabled(FEATURE_FLAGS.reportsV2)
    );
  }
}
