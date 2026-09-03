import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { SidebarV2Component } from './sidebar.component-v2';
import { SidebarService } from '../sidebar.service';

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
