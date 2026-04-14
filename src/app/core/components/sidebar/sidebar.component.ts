import { Component, effect, model, input, computed } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatTooltipModule } from '@angular/material/tooltip';

import { Menu } from './sidebar.model';
import { SidebarService } from './sidebar.service';

import { SIDEBAR_MENUS_NEW, SIDEBAR_MENUS_OLD } from './sidebar.model';

@Component({
  selector: 'app-sidebar',
  imports: [
    CommonModule,
    RouterModule,
    MatListModule,
    MatIconModule,
    MatTooltipModule,
  ],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
})
export class SidebarComponent {
  collapsed = model<boolean>();

  newSidebar = input<boolean>(false);

  menuItems = computed(() =>
    this.newSidebar() ? SIDEBAR_MENUS_NEW : SIDEBAR_MENUS_OLD
  );

  constructor(public sidebarService: SidebarService) {
    effect(() => {
      if (this.collapsed()) {
        this.sidebarService.closeMenu();
      }
    });
  }

  onMenuClick(item: Menu) {
    if (!item.children) {
      this.sidebarService.closeMenu();
      return;
    }

    if (this.collapsed()) {
      this.collapsed.set(false);
    }

    this.sidebarService.toggleMenu(item.label);
  }

  isParentActive(item: Menu): boolean {
    if (item.route) {
      return this.sidebarService.isRouteActive(item.route);
    }

    return !!item.children?.some(child =>
      this.sidebarService.isRouteActive(child.route!)
    );
  }

  getExpandedMenu(): string | null {
    return this.sidebarService.expandedMenu();
  }
}
