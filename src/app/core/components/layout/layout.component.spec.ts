import { Component, input, model, signal, WritableSignal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatSidenav } from '@angular/material/sidenav';
import { By } from '@angular/platform-browser';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideRouter, Router } from '@angular/router';

import { FeatureFlagsService } from '@core/components/feature-flags/feature-flags.service';
import { FEATURE_FLAGS } from '@core/components/feature-flags/feature-flags';
import { SidebarComponent } from '@core/components/sidebar/sidebar.component';
import { LAYOUT_MESSAGES } from '@core/constants/messages';
import { AuthService } from '@core/services/access/access.service';
import { UserDataService } from '@core/services/access/user-data.service';
import { ViewportService } from '@core/services/layout/viewport.service';
import { ToastNotificationComponent } from '@shared/components/toast-notification/toast-notification.component';
import { LayoutComponent } from './layout.component';

@Component({ selector: 'app-sidebar', template: '' })
class SidebarStubComponent {
  collapsed = model<boolean>();
  newSidebar = input<boolean>(false);
}

@Component({ selector: 'app-toast-notification', template: '' })
class ToastStubComponent {}

@Component({ template: '' })
class StudentsPageStubComponent {}

describe('LayoutComponent', () => {
  let fixture: ComponentFixture<LayoutComponent>;
  let isMobile: WritableSignal<boolean>;
  let homeEnabled: boolean;

  const menuButtonSelector = `button[aria-label="${LAYOUT_MESSAGES.OPEN_MENU}"]`;

  const sidenav = () =>
    fixture.debugElement.query(By.directive(MatSidenav))
      .componentInstance as MatSidenav;
  const content = () =>
    fixture.nativeElement.querySelector('mat-sidenav-content') as HTMLElement;
  const menuButton = () =>
    fixture.nativeElement.querySelector(
      menuButtonSelector
    ) as HTMLElement | null;

  const create = (mobile: boolean) => {
    isMobile.set(mobile);
    fixture = TestBed.createComponent(LayoutComponent);
    fixture.detectChanges();
  };

  beforeEach(async () => {
    isMobile = signal(false);
    homeEnabled = true;

    await TestBed.configureTestingModule({
      imports: [LayoutComponent],
      providers: [
        provideNoopAnimations(),
        provideRouter([
          { path: 'students', component: StudentsPageStubComponent },
        ]),
        { provide: ViewportService, useValue: { isMobile } },
        {
          provide: FeatureFlagsService,
          useValue: {
            isEnabled: (flag: string) =>
              flag === FEATURE_FLAGS.home ? homeEnabled : false,
            toggle: () => undefined,
          },
        },
        {
          provide: UserDataService,
          useValue: {
            user: signal({
              firstName: 'Ana',
              lastName: 'Torres',
              role: 'ERAS Administrator',
            }),
            clear: () => undefined,
          },
        },
        { provide: AuthService, useValue: { logout: () => undefined } },
      ],
    })
      .overrideComponent(LayoutComponent, {
        remove: { imports: [SidebarComponent, ToastNotificationComponent] },
        add: { imports: [SidebarStubComponent, ToastStubComponent] },
      })
      .compileComponents();
  });

  it('[659-improve-students-mobile-view/AC-1] hides the side menu and removes the content margin on a mobile screen', () => {
    // GIVEN a signed-in user on a mobile screen
    // WHEN they open any page
    create(true);

    // THEN the side menu is not visible
    expect(sidenav().mode).toBe('over');
    expect(sidenav().opened).toBeFalse();
    // AND no space is reserved for it
    expect(getComputedStyle(content()).marginLeft).toBe('0px');
  });

  it('[659-improve-students-mobile-view/AC-2] opens the side menu over the content when the header menu button is pressed', () => {
    // GIVEN a mobile screen with the side menu hidden
    create(true);
    expect(sidenav().opened).toBeFalse();

    // WHEN the user presses the menu button of the header
    menuButton()!.click();
    fixture.detectChanges();

    // THEN the side menu is shown over the content
    expect(sidenav().opened).toBeTrue();
    expect(sidenav().mode).toBe('over');
    // AND the content keeps its position
    expect(getComputedStyle(content()).marginLeft).toBe('0px');
  });

  it('[659-improve-students-mobile-view/AC-3] closes the side menu after navigating to Students', async () => {
    // GIVEN a mobile screen with the side menu open
    create(true);
    menuButton()!.click();
    fixture.detectChanges();
    expect(sidenav().opened).toBeTrue();

    // WHEN the user picks the entry that leads to Students
    await TestBed.inject(Router).navigateByUrl('/students');
    fixture.detectChanges();

    // THEN the Students page is shown and the side menu is closed
    expect(TestBed.inject(Router).url).toBe('/students');
    expect(
      fixture.debugElement.query(By.directive(StudentsPageStubComponent))
    ).toBeTruthy();
    expect(sidenav().opened).toBeFalse();
  });

  it('[659-improve-students-mobile-view/AC-4] closes the side menu when the backdrop is tapped', () => {
    // GIVEN a mobile screen with the side menu open
    create(true);
    menuButton()!.click();
    fixture.detectChanges();
    expect(sidenav().opened).toBeTrue();

    // WHEN the user taps on the content outside the menu
    (
      fixture.nativeElement.querySelector('.mat-drawer-backdrop') as HTMLElement
    ).click();
    fixture.detectChanges();

    // THEN the side menu is closed and the page is unchanged
    expect(sidenav().opened).toBeFalse();
    expect(TestBed.inject(Router).url).toBe('/');
  });

  it('[659-improve-students-mobile-view/AC-6] keeps the side menu beside the content and the full header on a 1280px screen', () => {
    // GIVEN a desktop screen
    // WHEN the user opens a page
    create(false);

    // THEN the side menu is visible beside the content
    const menu = fixture.nativeElement.querySelector(
      'mat-sidenav'
    ) as HTMLElement;
    expect(sidenav().mode).toBe('side');
    expect(sidenav().opened).toBeTrue();
    expect(content().style.marginLeft).toBe(menu.style.width);
    expect(content().style.marginLeft).not.toBe('0px');
    // AND the header has no menu button and keeps the user's name, role and notifications
    const header = fixture.nativeElement.querySelector(
      'mat-toolbar'
    ) as HTMLElement;
    expect(menuButton()).toBeNull();
    expect(header.textContent).toContain('Ana Torres');
    expect(header.textContent).toContain('ERAS Administrator');
    expect(header.textContent).toContain('notifications_none');
  });

  it('keeps the side menu coherent when the screen changes between desktop and mobile', () => {
    create(true);
    menuButton()!.click();
    fixture.detectChanges();
    expect(sidenav().opened).toBeTrue();

    isMobile.set(false);
    fixture.detectChanges();
    expect(sidenav().mode).toBe('side');
    expect(sidenav().opened).toBeTrue();

    isMobile.set(true);
    fixture.detectChanges();
    expect(sidenav().mode).toBe('over');
    expect(sidenav().opened).toBeFalse();
  });

  it('shows the menu button of the legacy header on a mobile screen and opens the side menu', () => {
    homeEnabled = false;
    create(true);

    expect(fixture.nativeElement.querySelector('app-header')).toBeTruthy();
    menuButton()!.click();
    fixture.detectChanges();

    expect(sidenav().opened).toBeTrue();
  });
});
