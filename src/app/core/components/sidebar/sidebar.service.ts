import { Injectable, signal } from '@angular/core';
import { IsActiveMatchOptions, NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Menu, SIDEBAR_MENUS } from './sidebar.model';

@Injectable({ providedIn: 'root' })
export class SidebarService {
  private readonly _currentUrl = signal<string>('');
  private readonly _isProduction: boolean | string = environment.production;
  private readonly _menuItems: Menu[] = SIDEBAR_MENUS;
  private readonly _matchOptions: IsActiveMatchOptions = {
    paths: 'subset',
    queryParams: 'ignored',
    matrixParams: 'ignored',
    fragment: 'ignored',
  };

  expandedMenu = signal<string | null>(null);

  constructor(private _router: Router) {
    this._router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this._currentUrl.set(event.urlAfterRedirects);
      });
  }

  closeMenu() {
    this.expandedMenu.set(null);
  }

  isRouteActive(route: string): boolean {
    return this._router.isActive(route, this._matchOptions);
  }

  getMenus() {
    return this._menuItems.filter(
      menu =>
        !('forProduction' in menu && menu.forProduction !== this._isProduction)
    );
  }

  toggleMenu(label: string) {
    this.expandedMenu.set(this.expandedMenu() === label ? null : label);
  }
}
