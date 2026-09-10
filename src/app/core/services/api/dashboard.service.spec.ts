import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { DashboardService } from './dashboard.service';
import { DashboardKpiResponse } from '@core/models/dashboard-kpis.model';
import { environment } from '../../../../environments/environment';

describe('DashboardService', () => {
  let service: DashboardService;
  let httpMock: HttpTestingController;

  const baseUrl = `${environment.apiUrl}/api/v1/dashboard`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [DashboardService],
    });
    service = TestBed.inject(DashboardService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getDashboardKPI', () => {
    it('should make a GET request to kpis and return the response', () => {
      const mockResponse = {
        totalStudents: 100,
      } as unknown as DashboardKpiResponse;

      service.getDashboardKPI().subscribe(res => {
        expect(res).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${baseUrl}/kpis`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should cache the response after the first successful fetch', () => {
      const mockResponse = {
        totalStudents: 100,
      } as unknown as DashboardKpiResponse;

      service.getDashboardKPI().subscribe();
      const req = httpMock.expectOne(`${baseUrl}/kpis`);
      req.flush(mockResponse);

      service.getDashboardKPI().subscribe(res => {
        expect(res).toEqual(mockResponse);
      });

      httpMock.expectNone(`${baseUrl}/kpis`);
    });

    it('should set lastFetchedAt after a successful fetch', () => {
      const mockResponse = {
        totalStudents: 100,
      } as unknown as DashboardKpiResponse;

      expect(service.getLastFetchedAt()).toBeNull();

      service.getDashboardKPI().subscribe();
      const req = httpMock.expectOne(`${baseUrl}/kpis`);
      req.flush(mockResponse);

      expect(service.getLastFetchedAt()).toBeInstanceOf(Date);
    });

    it('should not update lastFetchedAt when the cached value is returned', done => {
      const mockResponse = {
        totalStudents: 100,
      } as unknown as DashboardKpiResponse;

      service.getDashboardKPI().subscribe();
      const req = httpMock.expectOne(`${baseUrl}/kpis`);
      req.flush(mockResponse);

      const firstFetchedAt = service.getLastFetchedAt();

      setTimeout(() => {
        service.getDashboardKPI().subscribe(() => {
          expect(service.getLastFetchedAt()).toBe(firstFetchedAt);
          done();
        });
      }, 5);
    });

    it('should not emit a cached value if the fetch has not resolved yet', () => {
      service.getDashboardKPI().subscribe();

      const req = httpMock.expectOne(`${baseUrl}/kpis`);
      expect(req.request.method).toBe('GET');
      // No hacemos flush todavía: la caché sigue null en este punto,
      // así que una segunda llamada debería volver a golpear el backend.
      req.flush({} as DashboardKpiResponse);
    });
  });

  describe('getLastFetchedAt', () => {
    it('should return null before any fetch has happened', () => {
      expect(service.getLastFetchedAt()).toBeNull();
    });
  });

  describe('invalidateCache', () => {
    it('should clear cachedKpi and lastFetchedAt', () => {
      const mockResponse = {
        totalStudents: 100,
      } as unknown as DashboardKpiResponse;

      service.getDashboardKPI().subscribe();
      const req = httpMock.expectOne(`${baseUrl}/kpis`);
      req.flush(mockResponse);

      expect(service.getLastFetchedAt()).not.toBeNull();

      service.invalidateCache();

      expect(service.getLastFetchedAt()).toBeNull();
    });

    it('should force a new HTTP request after invalidation', () => {
      const mockResponse = {
        totalStudents: 100,
      } as unknown as DashboardKpiResponse;

      service.getDashboardKPI().subscribe();
      httpMock.expectOne(`${baseUrl}/kpis`).flush(mockResponse);

      service.invalidateCache();

      service.getDashboardKPI().subscribe(res => {
        expect(res).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${baseUrl}/kpis`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });
});
