import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { EvaluationDetailsService } from './evaluation-details.service';
import { EvaluationDetailsStudentResponse } from '@core/models/evaluation-details-student.model';
import { PagedResult } from '../interfaces/page.type';
import { Pagination } from '../interfaces/server.type';
import { RecentAlertsResponse } from '@core/models/recent-alerts-response.model';
import { environment } from '../../../../environments/environment';

describe('EvaluationDetailsService', () => {
  let service: EvaluationDetailsService;
  let httpMock: HttpTestingController;

  const baseUrl = `${environment.apiUrl}/api/v1/evaluations`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [EvaluationDetailsService],
    });
    service = TestBed.inject(EvaluationDetailsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getStudentsByFilters', () => {
    it('should send PollUuid, PageSize, Page, ComponentNames and CohortIds as base params', () => {
      const mockResponse = {} as PagedResult<EvaluationDetailsStudentResponse>;

      service
        .getStudentsByFilters(
          'poll-1',
          ['comp-a', 'comp-b'],
          [10, 20],
          [],
          25,
          1
        )
        .subscribe(res => expect(res).toEqual(mockResponse));

      const req = httpMock.expectOne(
        r =>
          r.url === `${baseUrl}/StudentsByFilters` &&
          r.params.get('PollUuid') === 'poll-1' &&
          r.params.get('PageSize') === '25' &&
          r.params.get('Page') === '1' &&
          r.params.getAll('ComponentNames')?.join(',') === 'comp-a,comp-b' &&
          r.params.getAll('CohortIds')?.join(',') === '10,20'
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should not append ComponentNames or CohortIds when the arrays are empty', () => {
      service.getStudentsByFilters('poll-1', [], [], [], 10, 1).subscribe();

      const req = httpMock.expectOne(
        r =>
          r.url === `${baseUrl}/StudentsByFilters` &&
          !r.params.has('ComponentNames') &&
          !r.params.has('CohortIds')
      );
      req.flush({});
    });

    it('should append VariableIds when provided', () => {
      service
        .getStudentsByFilters('poll-1', [], [], [1, 2, 3], 10, 1)
        .subscribe();

      const req = httpMock.expectOne(
        r =>
          r.url === `${baseUrl}/StudentsByFilters` &&
          r.params.getAll('VariableIds')?.join(',') === '1,2,3'
      );
      req.flush({});
    });

    it('should not append VariableIds when the array is empty', () => {
      service.getStudentsByFilters('poll-1', [], [], [], 10, 1).subscribe();

      const req = httpMock.expectOne(
        r =>
          r.url === `${baseUrl}/StudentsByFilters` &&
          !r.params.has('VariableIds')
      );
      req.flush({});
    });

    it('should append RiskLevels when provided', () => {
      service
        .getStudentsByFilters('poll-1', [], [], [], 10, 1, [1, 2])
        .subscribe();

      const req = httpMock.expectOne(
        r =>
          r.url === `${baseUrl}/StudentsByFilters` &&
          r.params.getAll('RiskLevels')?.join(',') === '1,2'
      );
      req.flush({});
    });

    it('should not append RiskLevels when not provided', () => {
      service.getStudentsByFilters('poll-1', [], [], [], 10, 1).subscribe();

      const req = httpMock.expectOne(
        r =>
          r.url === `${baseUrl}/StudentsByFilters` &&
          !r.params.has('RiskLevels')
      );
      req.flush({});
    });

    it('should not append RiskLevels when the array is empty', () => {
      service.getStudentsByFilters('poll-1', [], [], [], 10, 1, []).subscribe();

      const req = httpMock.expectOne(
        r =>
          r.url === `${baseUrl}/StudentsByFilters` &&
          !r.params.has('RiskLevels')
      );
      req.flush({});
    });

    it('should include evaluationId when provided as a number', () => {
      service
        .getStudentsByFilters('poll-1', [], [], [], 10, 1, [], 99)
        .subscribe();

      const req = httpMock.expectOne(
        r =>
          r.url === `${baseUrl}/StudentsByFilters` &&
          r.params.get('evaluationId') === '99'
      );
      req.flush({});
    });

    it('should include evaluationId when provided as a string', () => {
      service
        .getStudentsByFilters('poll-1', [], [], [], 10, 1, [], 'eval-99')
        .subscribe();

      const req = httpMock.expectOne(
        r =>
          r.url === `${baseUrl}/StudentsByFilters` &&
          r.params.get('evaluationId') === 'eval-99'
      );
      req.flush({});
    });

    it('should include evaluationId when it is 0 (avoid falsy bug)', () => {
      service
        .getStudentsByFilters('poll-1', [], [], [], 10, 1, [], 0)
        .subscribe();

      const req = httpMock.expectOne(
        r =>
          r.url === `${baseUrl}/StudentsByFilters` &&
          r.params.get('evaluationId') === '0'
      );
      req.flush({});
    });

    it('should not include evaluationId when undefined', () => {
      service
        .getStudentsByFilters('poll-1', [], [], [], 10, 1, [], undefined)
        .subscribe();

      const req = httpMock.expectOne(
        r =>
          r.url === `${baseUrl}/StudentsByFilters` &&
          !r.params.has('evaluationId')
      );
      req.flush({});
    });

    it('should not include evaluationId when null', () => {
      service
        .getStudentsByFilters(
          'poll-1',
          [],
          [],
          [],
          10,
          1,
          [],
          null as unknown as number
        )
        .subscribe();

      const req = httpMock.expectOne(
        r =>
          r.url === `${baseUrl}/StudentsByFilters` &&
          !r.params.has('evaluationId')
      );
      req.flush({});
    });
  });

  describe('getRecentAlerts', () => {
    it('should make a GET request to alerts with PageSize and Page params', () => {
      const pagination: Pagination = { page: 2, pageSize: 15 } as Pagination;
      const mockResponse = {} as PagedResult<RecentAlertsResponse>;

      service.getRecentAlerts(pagination).subscribe(res => {
        expect(res).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(
        r =>
          r.url === `${baseUrl}/alerts` &&
          r.params.get('PageSize') === '15' &&
          r.params.get('Page') === '2'
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });
});
