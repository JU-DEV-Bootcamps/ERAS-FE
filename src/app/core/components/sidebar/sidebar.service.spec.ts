import { TestBed } from '@angular/core/testing';
import { NavigationEnd, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { SidebarService } from './sidebar.service';
import { BaseModel } from '@core/models/common/base.model';

interface Menu {
  label: string;
  forProduction?: boolean;
}

describe('SidebarService', () => {
  let service: SidebarService;
  let routerEvents$: Subject<NavigationEnd | BaseModel>;
  let routerMock: {
    events: Subject<NavigationEnd | BaseModel>;
    isActive: jasmine.Spy;
  };

  beforeEach(() => {
    routerEvents$ = new Subject();
    routerMock = {
      events: routerEvents$,
      isActive: jasmine.createSpy('isActive').and.returnValue(false),
    };
    TestBed.configureTestingModule({
      providers: [SidebarService, { provide: Router, useValue: routerMock }],
    });

    service = TestBed.inject(SidebarService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should start with no expanded menu', () => {
    expect(service.expandedMenu()).toBeNull();
  });

  it('toggleMenu should expand a menu when none is expanded', () => {
    service.toggleMenu('Settings');
    expect(service.expandedMenu()).toBe('Settings');
  });

  it('toggleMenu should collapse the menu if the same label is toggled again', () => {
    service.toggleMenu('Settings');
    service.toggleMenu('Settings');
    expect(service.expandedMenu()).toBeNull();
  });

  it('toggleMenu should switch to a different menu when another label is toggled', () => {
    service.toggleMenu('Settings');
    service.toggleMenu('Profile');
    expect(service.expandedMenu()).toBe('Profile');
  });

  it('closeMenu should reset expandedMenu to null', () => {
    service.toggleMenu('Settings');
    service.closeMenu();
    expect(service.expandedMenu()).toBeNull();
  });

  it('isRouteActive should delegate to router.isActive with the match options', () => {
    routerMock.isActive.and.returnValue(true);
    const result = service.isRouteActive('/home');

    expect(result).toBeTrue();
    expect(routerMock.isActive).toHaveBeenCalledWith('/home', {
      paths: 'subset',
      queryParams: 'ignored',
      matrixParams: 'ignored',
      fragment: 'ignored',
    });
  });

  it('getMenus should keep menus without a forProduction property', () => {
    const menus: Menu[] = [{ label: 'A' }, { label: 'B' }];
    expect(service.getMenus(menus)).toEqual(menus);
  });

  it('getMenus should keep menus where forProduction is true', () => {
    const menus: Menu[] = [{ label: 'A', forProduction: true }];
    expect(service.getMenus(menus)).toEqual(menus);
  });

  it('getMenus should filter out menus where forProduction is false', () => {
    const menus: Menu[] = [
      { label: 'A', forProduction: false },
      { label: 'B' },
    ];
    expect(service.getMenus(menus)).toEqual([{ label: 'B' }]);
  });

  it('should update internal current url when a NavigationEnd event fires', () => {
    expect(() =>
      routerEvents$.next(new NavigationEnd(1, '/old', '/new-after-redirect'))
    ).not.toThrow();
  });

  it('should ignore non-NavigationEnd router events', () => {
    expect(() => routerEvents$.next({ id: 1 })).not.toThrow();
  });
});
