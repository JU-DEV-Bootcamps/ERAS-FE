import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter, RouterLink } from '@angular/router';
import { By } from '@angular/platform-browser';
import { SidebarV2Component } from './sidebar.component-v2';
import { SidebarService } from '../sidebar.service';
import { UserDataService } from '@core/services/access/user-data.service';
import { ERASRoles, Profile } from '@core/models/profile.model';
import { Menu } from '../sidebar.model';
import { SIDEBAR_MENUS_NEW } from './sidebar.model-v2';

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

describe('SidebarV2Component User Manuals item', () => {
  let fixture: ComponentFixture<SidebarV2Component>;
  const user = signal<Profile | null>(null);

  const userManualsItem = (): HTMLElement | undefined =>
    Array.from<HTMLElement>(
      fixture.nativeElement.querySelectorAll('mat-list-item.menu-item')
    ).find(item => item.textContent?.includes('User Manuals'));

  const userManualsLink = (): string | undefined =>
    fixture.debugElement
      .queryAll(By.directive(RouterLink))
      .find(el => el.nativeElement === userManualsItem())
      ?.injector.get(RouterLink)
      .urlTree?.toString();

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
            isRouteActive: (route: string) => route === '/user-manuals',
            expandedMenu: () => null,
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SidebarV2Component);
    fixture.componentRef.setInput('menuItems', SIDEBAR_MENUS_NEW);
  });

  it('[640-add-user-manuals-page/AC-1] highlights the User Manuals item and links to its page for a Professional', () => {
    user.set({ role: ERASRoles.PROFESSIONAL });
    fixture.detectChanges();

    const item = userManualsItem();

    expect(item).toBeDefined();
    expect(userManualsLink()).toBe('/user-manuals');
    expect(item?.classList).toContain('active-parent');
  });

  it('[640-add-user-manuals-page/AC-2] shows the User Manuals item to a Guest', () => {
    user.set({ role: ERASRoles.GUEST });
    fixture.detectChanges();

    const item = userManualsItem();

    expect(item).toBeDefined();
    expect(userManualsLink()).toBe('/user-manuals');
  });
});
