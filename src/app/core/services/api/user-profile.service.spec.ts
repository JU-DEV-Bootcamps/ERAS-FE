import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { UserProfileService } from './user-profile.service';
import {
  UpdateUserProfileRequest,
  UserProfile,
} from '../../models/user-profile.model';
import { environment } from '../../../../environments/environment';

describe('UserProfileService', () => {
  let service: UserProfileService;
  let httpMock: HttpTestingController;

  const baseUrl = `${environment.apiUrl}/api/v1/users`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [UserProfileService],
    });
    service = TestBed.inject(UserProfileService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getMyProfile', () => {
    it('should make a GET request to users/me/profile and return the response', () => {
      const mockResponse: UserProfile = {
        firstName: 'Roberto',
        lastName: 'Alvarez',
        email: 'roberto.alvarez@jala.university',
        employeeId: '#EMP-2024-882',
        department: 'Design',
        phone: '+1 (555) 123-4567',
        role: 'Faculty Practitioner',
        about: 'Passionate educator.',
      };

      service.getMyProfile().subscribe(res => {
        expect(res).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${baseUrl}/me/profile`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should map any HTTP error to an "Error fetching user profile" error', () => {
      let capturedError: Error | undefined;

      service.getMyProfile().subscribe({
        next: () => fail('expected an error, not a success'),
        error: err => (capturedError = err),
      });

      const req = httpMock.expectOne(`${baseUrl}/me/profile`);
      req.flush('server error', { status: 500, statusText: 'Server Error' });

      expect(capturedError).toBeTruthy();
      expect(capturedError?.message).toBe('Error fetching user profile');
    });
  });

  describe('updateMyProfile', () => {
    const payload: UpdateUserProfileRequest = {
      employeeId: '#EMP-2024-882',
      department: 'Design',
      phone: '+1 (555) 123-4567',
      about: 'Updated bio.',
    };

    it('should make a PUT request to users/me/profile with the payload and return the response', () => {
      const mockResponse: UserProfile = {
        firstName: 'Roberto',
        lastName: 'Alvarez',
        email: 'roberto.alvarez@jala.university',
        role: 'Faculty Practitioner',
        ...payload,
      };

      service.updateMyProfile('user-1', payload).subscribe(res => {
        expect(res).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${baseUrl}/me/profile`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(payload);
      req.flush(mockResponse);
    });

    it('should map any HTTP error to an "Error updating user profile" error', () => {
      let capturedError: Error | undefined;

      service.updateMyProfile('user-1', payload).subscribe({
        next: () => fail('expected an error, not a success'),
        error: err => (capturedError = err),
      });

      const req = httpMock.expectOne(`${baseUrl}/me/profile`);
      req.flush('server error', { status: 500, statusText: 'Server Error' });

      expect(capturedError).toBeTruthy();
      expect(capturedError?.message).toBe('Error updating user profile');
    });
  });
});
