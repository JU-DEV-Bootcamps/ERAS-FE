import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';

import { ProfileCardComponent } from './profile-card.component';
import { UserProfileService } from '@core/services/api/user-profile.service';
import { UserDataService } from '@core/services/access/user-data.service';
import { UserProfile } from '@core/models/user-profile.model';

describe('ProfileCardComponent', () => {
  let component: ProfileCardComponent;
  let fixture: ComponentFixture<ProfileCardComponent>;
  let mockUserProfileService: jasmine.SpyObj<UserProfileService>;
  let mockUserDataService: jasmine.SpyObj<UserDataService>;

  const mockProfile: UserProfile = {
    firstName: 'Roberto',
    lastName: 'Alvarez',
    email: 'roberto.alvarez@jala.university',
    isOnline: true,
    employeeId: '#EMP-2024-882',
    department: 'Design',
    phone: '+1 (555) 123-4567',
    role: 'Faculty Practitioner',
    about: 'Passionate educator with over 20 years of experience.',
  };

  beforeEach(async () => {
    mockUserProfileService = jasmine.createSpyObj('UserProfileService', [
      'getMyProfile',
    ]);
    mockUserDataService = jasmine.createSpyObj<UserDataService>(
      'UserDataService',
      ['user']
    );
    mockUserDataService.user.and.returnValue(null);

    await TestBed.configureTestingModule({
      imports: [ProfileCardComponent],
      providers: [
        { provide: UserProfileService, useValue: mockUserProfileService },
        { provide: UserDataService, useValue: mockUserDataService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProfileCardComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    mockUserProfileService.getMyProfile.and.returnValue(of(mockProfile));
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should load the profile on init', () => {
    mockUserProfileService.getMyProfile.and.returnValue(of(mockProfile));
    fixture.detectChanges();

    expect(mockUserProfileService.getMyProfile).toHaveBeenCalled();
    expect(component.profile).toEqual(mockProfile);
    expect(component.isLoading).toBeFalse();
    expect(component.hasError).toBeFalse();
  });

  it('should set hasError when the request fails', () => {
    mockUserProfileService.getMyProfile.and.returnValue(
      throwError(() => new Error('Error fetching user profile'))
    );
    fixture.detectChanges();

    expect(component.hasError).toBeTrue();
    expect(component.isLoading).toBeFalse();
    expect(component.profile).toBeNull();
  });

  describe('initials', () => {
    it('should build initials from the first and last name', () => {
      mockUserProfileService.getMyProfile.and.returnValue(of(mockProfile));
      fixture.detectChanges();

      expect(component.initials).toBe('RA');
    });
  });

  describe('avatarColor', () => {
    it('should return the same color for the same name on every call', () => {
      mockUserProfileService.getMyProfile.and.returnValue(of(mockProfile));
      fixture.detectChanges();

      expect(component.avatarColor).toBe(component.avatarColor);
    });
  });
});
