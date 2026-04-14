import {
  Component,
  computed,
  inject,
  OnInit,
  model,
  signal,
} from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
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
import { filter } from 'rxjs';

import { SidebarComponent } from '@core/components/sidebar/sidebar.component';
import { UserMenuComponent } from './user-menu/user-menu.component';

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
    UserMenuComponent,
    SidebarComponent,
  ],
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss'],
})
export class LayoutComponent implements OnInit {
  private breakpointObserver = inject(BreakpointObserver);
  private router = inject(Router);

  collapsed = model<boolean>(false);
  newSidebar = signal<boolean>(true);

  sidenavWidth = computed(() => {
    if (this.newSidebar()) {
      return Sidenav.newExpand;
    }
    return this.collapsed() ? Sidenav.shrink : Sidenav.expand;
  });

  ngOnInit() {
    this.readSidebarFlag();

    this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe(() => this.readSidebarFlag());

    this.breakpointObserver
      .observe([Breakpoints.Small, '(max-width: 1200px)'])
      .subscribe((state: BreakpointState) => this.collapsed.set(state.matches));
  }

  private readSidebarFlag(): void {
    const params = new URLSearchParams(window.location.search);

    if (params.has('newSidebar')) {
      this.newSidebar.set(params.get('newSidebar') !== 'false');
    } else {
      this.newSidebar.set(true);
    }
  }
}
