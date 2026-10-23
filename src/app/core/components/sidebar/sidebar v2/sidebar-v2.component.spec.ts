import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { SidebarV2Component } from './sidebar.component-v2';
import { SidebarService } from '../sidebar.service';
import { UserDataService } from '@core/services/access/user-data.service';
import { ERASRoles, Profile } from '@core/models/profile.model';
import { Menu } from '../sidebar.model';

describe('SidebarV2Component', () => {
  let component: SidebarV2Component;
  let fixture: ComponentFixture<SidebarV2Component>;
  let sidebarService: jasmine.SpyObj<SidebarService>;

  beforeEach(async () => {
    const sidebarServiceSpy = jasmine.createSpyObj(
      'SidebarService',
      ['closeMenu', 'toggleMenu', 'isRouteActive'],
      { expandedMenu: jasmine.createSpy('expandedMenu') }
    );
    await TestBed.configureTestingModule({
      imports: [SidebarV2Component],
      providers: [
        { provide: SidebarService, useValue: sidebarServiceSpy },
        { provide: ActivatedRoute, useValue: {} },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SidebarV2Component);
    component = fixture.componentInstance;
    sidebarService = TestBed.inject(
      SidebarService
    ) as jasmine.SpyObj<SidebarService>;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should click menu and toggle menu successfully when item has children', () => {
    const itemMenu = {
      label: 'normal',
      children: [{ label: 'child', route: 'child' }],
    };
    component.onMenuClick(itemMenu);
    expect(sidebarService.toggleMenu).toHaveBeenCalledWith('normal');
    expect(sidebarService.closeMenu).not.toHaveBeenCalled();
  });

  it('should click menu and close menu without children', () => {
    const itemMenu = { label: 'normal' };
    component.onMenuClick(itemMenu);
    expect(sidebarService.closeMenu).toHaveBeenCalled();
  });

  it('isParentActive should return the active state of the item route', () => {
    const itemMenu = { label: 'normal', route: 'route/v1' };
    sidebarService.isRouteActive.and.returnValue(true);
    const result = component.isParentActive(itemMenu);

    expect(result).toBeTrue();
    expect(sidebarService.isRouteActive).toHaveBeenCalledWith('route/v1');
  });

  it('isParentActive should return true value when a child route is active', () => {
    const itemMenu = {
      label: 'normal',
      children: [
        { label: 'child', route: 'route/v1' },
        { label: 'another child', route: 'route/v2' },
      ],
    };

    sidebarService.isRouteActive.and.callFake(
      (route: string) => route === 'route/v1'
    );
    const result = component.isParentActive(itemMenu);
    expect(result).toBeTrue();
    expect(sidebarService.isRouteActive).toHaveBeenCalledWith('route/v1');
  });

  it('getExpandedMenu should return value of expanded menu', () => {
    sidebarService.expandedMenu.and.returnValue(null);
    const result = component.getExpandedMenu();
    expect(result).toBeNull();
  });
});

describe('SidebarV2Component role-based rendering', () => {
  let fixture: ComponentFixture<SidebarV2Component>;
  const user = signal<Profile | null>(null);

  const menus: Menu[] = [
    {
      label: 'Reports',
      icon: 'pie_chart',
      requiredRoles: [ERASRoles.ADMIN],
      children: [
        {
          label: 'Charts',
          route: '/charts',
          requiredRoles: [ERASRoles.ADMIN],
        },
      ],
    },
    {
      label: 'Home',
      icon: 'home',
      route: '/home',
      requiredRoles: [ERASRoles.ADMIN],
    },
  ];

  const menuItemCount = () =>
    fixture.nativeElement.querySelectorAll('mat-list-item.menu-item').length;

  beforeEach(async () => {
    user.set(null);
    await TestBed.configureTestingModule({
      imports: [SidebarV2Component],
      providers: [
        provideRouter([]),
        { provide: UserDataService, useValue: { user } },
        {
          provide: SidebarService,
          useValue: {
            closeMenu: () => undefined,
            toggleMenu: () => undefined,
            isRouteActive: () => false,
            expandedMenu: () => 'Reports',
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SidebarV2Component);
    fixture.componentRef.setInput('menuItems', menus);
  });

  it('should render every allowed menu item and the expanded submenu without throwing', () => {
    user.set({ role: ERASRoles.ADMIN });

    expect(() => fixture.detectChanges()).not.toThrow();

    expect(menuItemCount()).toBe(2);
    expect(
      fixture.nativeElement.querySelectorAll('mat-list-item.submenu-item')
        .length
    ).toBe(1);
  });

  it('should render the menu once the user profile arrives after the first render', () => {
    fixture.detectChanges();
    expect(menuItemCount()).toBe(0);

    user.set({ role: ERASRoles.ADMIN });
    fixture.detectChanges();

    expect(menuItemCount()).toBe(2);
  });

  it('should hide the menu items when the user role no longer matches', () => {
    user.set({ role: ERASRoles.ADMIN });
    fixture.detectChanges();
    expect(menuItemCount()).toBe(2);

    user.set({ role: ERASRoles.PROFESSIONAL });
    fixture.detectChanges();

    expect(menuItemCount()).toBe(0);
  });
});
