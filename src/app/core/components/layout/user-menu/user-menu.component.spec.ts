import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of } from 'rxjs';

import { FeatureFlagsService } from '@core/components/feature-flags/feature-flags.service';
import { FEATURE_FLAGS } from '@core/components/feature-flags/feature-flags';
import { AuthService } from '@core/services/access/access.service';
import { UserDataService } from '@core/services/access/user-data.service';
import { UserMenuComponent } from './user-menu.component';

describe('UserMenuComponent', () => {
  let fixture: ComponentFixture<UserMenuComponent>;
  let component: UserMenuComponent;
  let featureFlags: jasmine.SpyObj<FeatureFlagsService>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    featureFlags = jasmine.createSpyObj('FeatureFlagsService', [
      'isEnabled',
      'toggle',
    ]);
    featureFlags.isEnabled.and.returnValue(true);
    featureFlags.toggle.and.returnValue(of(void 0));
    router = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [UserMenuComponent],
      providers: [
        { provide: FeatureFlagsService, useValue: featureFlags },
        { provide: Router, useValue: router },
        {
          provide: UserDataService,
          useValue: { user: signal(null), clear: jasmine.createSpy('clear') },
        },
        {
          provide: AuthService,
          useValue: jasmine.createSpyObj('AuthService', ['logout']),
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(UserMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  const toggleEvent = (checked: boolean) =>
    ({ target: { checked } }) as unknown as Event;

  it('should be on v2 (V1 switch off) while the v2 flag is enabled', () => {
    expect(component.v1Enabled()).toBeFalse();
    expect(featureFlags.isEnabled).toHaveBeenCalledWith(FEATURE_FLAGS.home);
  });

  it('should show the V1 switch on when v2 is disabled', () => {
    featureFlags.isEnabled.and.returnValue(false);

    const other = TestBed.createComponent(UserMenuComponent).componentInstance;

    expect(other.v1Enabled()).toBeTrue();
  });

  it('should disable the v2 flag when the V1 switch is turned on', () => {
    component.onV1Toggle(toggleEvent(true));

    expect(featureFlags.toggle).toHaveBeenCalledWith('v2', false);
  });

  it('should enable the v2 flag when the V1 switch is turned off', () => {
    component.onV1Toggle(toggleEvent(false));

    expect(featureFlags.toggle).toHaveBeenCalledWith('v2', true);
  });

  it('should navigate to the account information and the settings', () => {
    component.redirectToAccountInformation();
    component.redirectToSettings();

    expect(router.navigate).toHaveBeenCalledWith(['account-and-information']);
    expect(router.navigate).toHaveBeenCalledWith(['cosmic-latte']);
  });
});
