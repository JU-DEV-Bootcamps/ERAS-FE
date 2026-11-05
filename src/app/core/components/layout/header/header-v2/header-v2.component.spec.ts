import { signal, WritableSignal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';

import { FeatureFlagsService } from '@core/components/feature-flags/feature-flags.service';
import { LAYOUT_MESSAGES } from '@core/constants/messages';
import { AuthService } from '@core/services/access/access.service';
import { UserDataService } from '@core/services/access/user-data.service';
import { ViewportService } from '@core/services/layout/viewport.service';
import { HeaderV2Component } from './header-v2.component';

describe('HeaderV2Component', () => {
  let fixture: ComponentFixture<HeaderV2Component>;
  let isMobile: WritableSignal<boolean>;

  const menuButtonSelector = `button[aria-label="${LAYOUT_MESSAGES.OPEN_MENU}"]`;
  const header = () =>
    fixture.nativeElement.querySelector('mat-toolbar') as HTMLElement;
  const menuButton = () =>
    fixture.nativeElement.querySelector(
      menuButtonSelector
    ) as HTMLElement | null;

  const create = (mobile: boolean) => {
    isMobile.set(mobile);
    fixture = TestBed.createComponent(HeaderV2Component);
    fixture.componentRef.setInput('sectionTitle', 'Students');
    fixture.detectChanges();
  };

  beforeEach(async () => {
    isMobile = signal(false);

    await TestBed.configureTestingModule({
      imports: [HeaderV2Component],
      providers: [
        provideNoopAnimations(),
        provideRouter([]),
        { provide: ViewportService, useValue: { isMobile } },
        {
          provide: FeatureFlagsService,
          useValue: { isEnabled: () => true, toggle: () => undefined },
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
    }).compileComponents();
  });

  it('[659-improve-students-mobile-view/AC-5] shows only the menu button, the title and the user menu on mobile', () => {
    // GIVEN the signed-in user "Ana Torres" with the role "ERAS Administrator" on a mobile screen
    // WHEN they open the "Students" page
    create(true);

    // THEN the header shows the menu button, its title and the user menu
    expect(menuButton()).toBeTruthy();
    expect(header().querySelector('.app-title')?.textContent).toContain(
      'Students'
    );
    expect(header().querySelector('app-user-menu')).toBeTruthy();
    // AND the header itself does not show the name, the role or the notifications icon
    expect(header().textContent).not.toContain('Ana Torres');
    expect(header().textContent).not.toContain('ERAS Administrator');
    expect(header().textContent).not.toContain('notifications_none');
  });

  it('emits menuToggle when the menu button is pressed', () => {
    create(true);
    const toggled = jasmine.createSpy('menuToggle');
    fixture.componentInstance.menuToggle.subscribe(toggled);

    menuButton()!.click();

    expect(toggled).toHaveBeenCalledTimes(1);
  });
});
