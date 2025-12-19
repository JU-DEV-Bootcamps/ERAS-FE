import { Component, computed, inject, OnInit, model } from '@angular/core';
import { RouterOutlet } from '@angular/router';
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
import { UserMenuComponent } from './user-menu/user-menu.component';

enum Sidenav {
  shrink = '70px',
  expand = '250px',
}

@Component({
  selector: 'app-layout',
  imports: [
    CommonModule,
    MatSidenavModule,
    MatToolbarModule,
    RouterOutlet,
    CommonModule,
    MatSidenavModule,
    MatButtonModule,
    MatRadioModule,
    FormsModule,
    ReactiveFormsModule,
    MatIconModule,
    MatToolbarModule,
    MatMenuModule,
    UserMenuComponent,
    SidebarComponent,
  ],
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss'],
})
export class LayoutComponent implements OnInit {
  breakpointObserver = inject(BreakpointObserver);
  collapsed = model<boolean>(false);
  sidenavWidth = computed(() =>
    this.collapsed() ? Sidenav.shrink : Sidenav.expand
  );

  ngOnInit() {
    this.breakpointObserver
      .observe([Breakpoints.Small, '(max-width: 1200px)'])
      .subscribe((state: BreakpointState) => this.collapsed.set(state.matches));
  }
}
