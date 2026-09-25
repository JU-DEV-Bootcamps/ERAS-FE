import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { SidebarComponent } from './sidebar.component';
import { SidebarService } from './sidebar.service';
import { Menu, SIDEBAR_MENUS_OLD } from './sidebar.model';
import { SIDEBAR_MENUS_NEW } from './sidebar v2/sidebar.model-v2';

describe('SidebarComponent', () => {
  let component: SidebarComponent;
  let fixture: ComponentFixture<SidebarComponent>;
  let sidebarService: jasmine.SpyObj<SidebarService>;

  beforeEach(async () => {
    const sidebarServiceSpy = jasmine.createSpyObj(
      'SidebarService',
      ['closeMenu', 'toggleMenu', 'isRouteActive', 'getMenus'],
      { expandedMenu: jasmine.createSpy('expandedMenu') }
    );
    await TestBed.configureTestingModule({
      imports: [SidebarComponent],
      providers: [
        { provide: ActivatedRoute, useValue: {} },
        { provide: SidebarService, useValue: sidebarServiceSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SidebarComponent);
    component = fixture.componentInstance;
    sidebarService = TestBed.inject(
      SidebarService
    ) as jasmine.SpyObj<SidebarService>;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should use new sidebar menus when newSidebar is true', () => {
    const newMenus = [{ label: 'New menu' }] as Menu[];
    sidebarService.getMenus.and.returnValue(newMenus);
    fixture.componentRef.setInput('newSidebar', true);
    fixture.detectChanges();

    expect(component.menuItems()).toEqual(newMenus);
    expect(sidebarService.getMenus).toHaveBeenCalledWith(SIDEBAR_MENUS_NEW);
  });

  it('should use old sidebar menus when newSidebar is false', () => {
    const oldMenus = [{ label: 'Old menu' }] as Menu[];
    sidebarService.getMenus.and.returnValue(oldMenus);
    fixture.componentRef.setInput('newSidebar', false);
    fixture.detectChanges();

    expect(sidebarService.getMenus).toHaveBeenCalledWith(SIDEBAR_MENUS_OLD);
  });

  it('should click menu and toggle menu successfully when item has children', () => {
    const itemMenu = {
      label: 'normal',
      children: [{ label: 'child', route: 'child' }],
    };
    component.collapsed.set(true);
    component.onMenuClick(itemMenu);
    expect(sidebarService.toggleMenu).toHaveBeenCalledWith('normal');
    expect(component.collapsed()).toBeFalse();
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
