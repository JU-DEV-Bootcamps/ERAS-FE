import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { ErasUserProfile, UsersService } from './users.service';
import { environment } from '../../../../environments/environment';

describe('UsersService', () => {
  let service: UsersService;
  let httpMock: HttpTestingController;

  const baseUrl = `${environment.apiUrl}/api/v1/users`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [UsersService],
    });
    service = TestBed.inject(UsersService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create the service', () => {
    expect(service).toBeTruthy();
  });

  describe('sync', () => {
    it('should POST to /sync', () => {
      service.sync().subscribe();

      const req = httpMock.expectOne(`${baseUrl}/sync`);
      expect(req.request.method).toBe('POST');
      req.flush({});
    });
  });

  describe('getByRole', () => {
    it('should GET with a role query param', () => {
      const mockResponse: ErasUserProfile[] = [
        {
          sub: 'sub-1',
          email: 'a@b.com',
          firstName: 'A',
          lastName: 'B',
          role: 'ERAS Professional',
        },
      ];

      service.getByRole('ERAS Professional').subscribe(res => {
        expect(res).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(
        r =>
          r.url === `${baseUrl}/` &&
          r.params.get('role') === 'ERAS Professional'
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should GET without a role query param when no role is given', () => {
      const mockResponse: ErasUserProfile[] = [
        {
          sub: 'sub-1',
          email: 'a@b.com',
          firstName: 'A',
          lastName: 'B',
          role: 'ERAS Professional',
        },
      ];

      service.getByRole().subscribe(res => {
        expect(res).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(
        r => r.url === `${baseUrl}/` && r.params.get('role') === null
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });
});
