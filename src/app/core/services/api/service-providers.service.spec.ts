import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { ServiceProvidersService } from './service-providers.service';
import { ServiceProviderModel } from '../../models/service-providers.model';
import { environment } from '../../../../environments/environment';

describe('ServiceProvidersService', () => {
  let service: ServiceProvidersService;
  let httpMock: HttpTestingController;

  const baseUrl = `${environment.apiUrl}/api/v1/service-providers`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ServiceProvidersService],
    });
    service = TestBed.inject(ServiceProvidersService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getAllServiceProviders', () => {
    it('should make a GET request to the correct URL and return the data', () => {
      const mockResponse: ServiceProviderModel[] = [
        { id: 1 } as unknown as ServiceProviderModel,
      ];

      service.getAllServiceProviders().subscribe(res => {
        expect(res).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${baseUrl}/`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should cache the Observable and return the same reference on the second call', () => {
      const obs1 = service.getAllServiceProviders();
      const obs2 = service.getAllServiceProviders();

      expect(obs1).toBe(obs2);
    });

    it('should assign the result to serviceProvidersCache$ after the first call', () => {
      expect(service.serviceProvidersCache$).toBeNull();

      const obs1 = service.getAllServiceProviders();
      obs1.subscribe();

      expect(service.serviceProvidersCache$).toBe(obs1);

      const req = httpMock.expectOne(`${baseUrl}/`);
      req.flush([]);
    });

    it('should not create a new Observable if serviceProvidersCache$ already exists', () => {
      const fakeCache$ = service.getAllServiceProviders();
      fakeCache$.subscribe();
      const req1 = httpMock.expectOne(`${baseUrl}/`);
      req1.flush([]);

      const getSpy = spyOn(service, 'get').and.callThrough();

      const result = service.getAllServiceProviders();

      expect(result).toBe(fakeCache$);
      expect(getSpy).not.toHaveBeenCalled();
    });
  });
});
