import { Component, input } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatTooltipModule } from '@angular/material/tooltip';

import { Menu } from '../sidebar.model';
import { SidebarService } from '../sidebar.service';

@Component({
  selector: 'app-sidebar-v2',
  imports: [
    CommonModule,
    RouterModule,
    MatListModule,
    MatIconModule,
    MatTooltipModule,
  ],
  templateUrl: './sidebar.component-v2.html',
  styleUrl: './sidebar.component-v2.scss',
})
export class SidebarV2Component {
  menuItems = input<Menu[]>([]);

  constructor(public sidebarService: SidebarService) {}

  onMenuClick(item: Menu) {
    if (!item.children) {
      this.sidebarService.closeMenu();
      return;
    }
    this.sidebarService.toggleMenu(item.label);
  }

  isParentActive(item: Menu): boolean {
    if (item.route) return this.sidebarService.isRouteActive(item.route);
    return !!item.children?.some(child =>
      this.sidebarService.isRouteActive(child.route!)
    );
  }

  getExpandedMenu(): string | null {
    return this.sidebarService.expandedMenu();
  }
}
