import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { ConfigurationsService } from './configurations.service';
import { ConfigurationsModel } from '../../models/configurations.model';
import { environment } from '../../../../environments/environment';

describe('ConfigurationsService', () => {
  let service: ConfigurationsService;
  let httpMock: HttpTestingController;

  const baseUrl = `${environment.apiUrl}/api/v1/configurations`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ConfigurationsService],
    });
    service = TestBed.inject(ConfigurationsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getAllConfigurations', () => {
    it('should make a GET request to the correct URL and return the data', () => {
      const mockResponse: ConfigurationsModel[] = [
        { id: 1 } as ConfigurationsModel,
      ];

      service.getAllConfigurations().subscribe(res => {
        expect(res).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${baseUrl}/`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should cache the Observable and return the same reference on the second call', () => {
      const obs1 = service.getAllConfigurations();
      const obs2 = service.getAllConfigurations();

      expect(obs1).toBe(obs2);
    });

    it('should assign the result to configurationsCache$ after the first call', () => {
      expect(service.configurationsCache$).toBeNull();

      const obs1 = service.getAllConfigurations();
      obs1.subscribe();

      expect(service.configurationsCache$).toBe(obs1);

      const req = httpMock.expectOne(`${baseUrl}/`);
      req.flush([]);
    });

    it('should not create a new Observable if configurationsCache$ already exists', () => {
      const fakeCache$ = service.getAllConfigurations();
      fakeCache$.subscribe();
      const req1 = httpMock.expectOne(`${baseUrl}/`);
      req1.flush([]);

      const getSpy = spyOn(service, 'get').and.callThrough();

      const result = service.getAllConfigurations();

      expect(result).toBe(fakeCache$);
      expect(getSpy).not.toHaveBeenCalled();
    });
  });

  describe('getConfigurationsByUserId', () => {
    it('should make a GET request to the URL with the userId', () => {
      const mockResponse: ConfigurationsModel[] = [
        { id: 2 } as ConfigurationsModel,
      ];

      service.getConfigurationsByUserId('user-123').subscribe(res => {
        expect(res).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${baseUrl}/user-123`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });

  describe('createConfiguration', () => {
    it('should make a POST request with the correct body', () => {
      const configuration = { name: 'new' } as unknown as ConfigurationsModel;
      const mockResponse = {
        id: 3,
        name: 'new',
      } as unknown as ConfigurationsModel;

      service.createConfiguration(configuration).subscribe(res => {
        expect(res).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${baseUrl}/`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(configuration);
      req.flush(mockResponse);
    });
  });

  describe('updateConfiguration', () => {
    it('should make a PUT request with the correct body', () => {
      const configuration = {
        id: 4,
        name: 'updated',
      } as unknown as ConfigurationsModel;

      service.updateConfiguration(configuration).subscribe(res => {
        expect(res).toEqual(configuration);
      });

      const req = httpMock.expectOne(`${baseUrl}/`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(configuration);
      req.flush(configuration);
    });
  });

  describe('deleteConfiguration', () => {
    it('should make a DELETE request to the URL with the configurationId', () => {
      service.deleteConfiguration(7).subscribe();

      const req = httpMock.expectOne(`${baseUrl}/7`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });
  });
});
