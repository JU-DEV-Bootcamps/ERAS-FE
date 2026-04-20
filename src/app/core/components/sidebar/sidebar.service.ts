import { Injectable, signal } from '@angular/core';
import { IsActiveMatchOptions, NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';
import { Menu } from './sidebar.model';

@Injectable({ providedIn: 'root' })
export class SidebarService {
  private readonly _currentUrl = signal<string>('');

  private readonly _matchOptions: IsActiveMatchOptions = {
    paths: 'subset',
    queryParams: 'ignored',
    matrixParams: 'ignored',
    fragment: 'ignored',
  };

  expandedMenu = signal<string | null>(null);

  constructor(private _router: Router) {
    this._router.events
      .pipe(
        filter(
          (event): event is NavigationEnd => event instanceof NavigationEnd
        )
      )
      .subscribe(event => {
        this._currentUrl.set(event.urlAfterRedirects);
      });
  }

  closeMenu() {
    this.expandedMenu.set(null);
  }

  isRouteActive(route: string): boolean {
    return this._router.isActive(route, this._matchOptions);
  }

  getMenus(menus: Menu[]): Menu[] {
    return menus.filter(
      menu => !('forProduction' in menu && menu.forProduction !== true)
    );
  }

  toggleMenu(label: string) {
    this.expandedMenu.set(this.expandedMenu() === label ? null : label);
  }
}
