import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { CohortService } from './cohort.service';
import { CohortModel } from '../../models/cohort.model';
import { CohortsSummaryModel } from '../../models/summary.model';
import { ApiResponse } from '../../models/api-response.model';
import { Pagination } from '../interfaces/server.type';
import { environment } from '../../../../environments/environment';

describe('CohortService', () => {
  let service: CohortService;
  let httpMock: HttpTestingController;

  const baseUrl = `${environment.apiUrl}/api/v1/cohorts`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [CohortService],
    });
    service = TestBed.inject(CohortService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create the service', () => {
    expect(service).toBeTruthy();
  });

  describe('getCohorts', () => {
    it('should use empty pollUuid and lastVersion=true by default', () => {
      const mockResponse: ApiResponse<CohortModel[]> = {
        data: [],
      } as unknown as ApiResponse<CohortModel[]>;

      service.getCohorts().subscribe(res => {
        expect(res).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(
        r =>
          r.url === `${baseUrl}/` &&
          r.params.get('pollUuid') === '' &&
          r.params.get('lastVersion') === 'true'
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should send the received pollUuid as a parameter', () => {
      service.getCohorts('abc-123').subscribe();

      const req = httpMock.expectOne(
        r =>
          r.url === `${baseUrl}/` &&
          r.params.get('pollUuid') === 'abc-123' &&
          r.params.get('lastVersion') === 'true'
      );
      expect(req.request.method).toBe('GET');
      req.flush({});
    });

    it('should send lastVersion=false when indicated explicitly', () => {
      service.getCohorts('abc-123', false).subscribe();

      const req = httpMock.expectOne(
        r =>
          r.url === `${baseUrl}/` &&
          r.params.get('pollUuid') === 'abc-123' &&
          r.params.get('lastVersion') === 'false'
      );
      expect(req.request.method).toBe('GET');
      req.flush({});
    });

    it('should treat pollUuid=null the same as not sending the parameter (empty string)', () => {
      service.getCohorts(null).subscribe();

      const req = httpMock.expectOne(
        r => r.url === `${baseUrl}/` && r.params.get('pollUuid') === ''
      );
      req.flush({});
    });
  });

  describe('getCohortsSummary', () => {
    it('should send PageSize and Page without EvaluationId when not provided', () => {
      const pagination: Pagination = { page: 1, pageSize: 10 } as Pagination;
      const mockResponse = {} as CohortsSummaryModel;

      service.getCohortsSummary(pagination).subscribe(res => {
        expect(res).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(
        r =>
          r.url === `${baseUrl}/summary` &&
          r.params.get('PageSize') === '10' &&
          r.params.get('Page') === '1' &&
          !r.params.has('EvaluationId')
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should include EvaluationId when provided', () => {
      const pagination: Pagination = { page: 2, pageSize: 25 } as Pagination;

      service.getCohortsSummary(pagination, 99).subscribe();

      const req = httpMock.expectOne(
        r =>
          r.url === `${baseUrl}/summary` &&
          r.params.get('PageSize') === '25' &&
          r.params.get('Page') === '2' &&
          r.params.get('EvaluationId') === '99'
      );
      expect(req.request.method).toBe('GET');
      req.flush({});
    });

    it('should include EvaluationId=0 (evitar el bug de falsy con !=)', () => {
      const pagination: Pagination = { page: 1, pageSize: 10 } as Pagination;

      service.getCohortsSummary(pagination, 0).subscribe();

      const req = httpMock.expectOne(
        r =>
          r.url === `${baseUrl}/summary` && r.params.get('EvaluationId') === '0'
      );
      req.flush({});
    });

    it('should not include EvaluationId when it is undefined', () => {
      const pagination: Pagination = { page: 1, pageSize: 10 } as Pagination;

      service.getCohortsSummary(pagination, undefined).subscribe();

      const req = httpMock.expectOne(
        r => r.url === `${baseUrl}/summary` && !r.params.has('EvaluationId')
      );
      req.flush({});
    });
  });

  describe('getCohortsDetails', () => {
    it('should make a GET request to /details', () => {
      const mockResponse = {} as CohortsSummaryModel;

      service.getCohortsDetails().subscribe(res => {
        expect(res).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${baseUrl}/details`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });
});
