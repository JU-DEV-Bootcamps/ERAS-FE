import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { PollInstanceService } from './poll-instance.service';
import { ApiResponse } from '../../models/api-response.model';
import { PollInstanceModel } from '../../models/poll-instance.model';
import { ServerResponse } from '../interfaces/server.type';
import { ComponentsAvgModel } from '../../models/components-avg.model';
import { ComponentsAvgGroupedByCohortsModel } from '../../models/reports/avg-reports';
import { PagedResult } from '../interfaces/page.type';
import { environment } from '../../../../environments/environment';

describe('PollInstanceService', () => {
  let service: PollInstanceService;
  let httpMock: HttpTestingController;

  const baseUrl = `${environment.apiUrl}/api/v1/poll-instances`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [PollInstanceService],
    });
    service = TestBed.inject(PollInstanceService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getPollInstancesByLastDays', () => {
    it('should make a GET request with lastDays param', () => {
      const mockResponse = {} as ServerResponse;

      service.getPollInstancesByLastDays(30).subscribe(res => {
        expect(res).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(
        r => r.url === `${baseUrl}/` && r.params.get('lastDays') === '30'
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });

  describe('getPollInstancesByFilters', () => {
    it('should send page, pageSize, days, lastVersion and pollUuid as base params', () => {
      const mockResponse = {} as ApiResponse<PagedResult<PollInstanceModel>>;

      service
        .getPollInstancesByFilters({
          cohortIds: [],
          page: 1,
          pageSize: 10,
          lastVersion: true,
          pollUuid: 'poll-1',
        })
        .subscribe(res => expect(res).toEqual(mockResponse));

      const req = httpMock.expectOne(
        r =>
          r.url === `${baseUrl}/poll-1` &&
          r.params.get('page') === '1' &&
          r.params.get('pageSize') === '10' &&
          r.params.get('days') === '400' &&
          r.params.get('lastVersion') === 'true' &&
          r.params.get('pollUuid') === 'poll-1'
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should use the provided lastDays instead of the default 400', () => {
      service
        .getPollInstancesByFilters({
          cohortIds: [],
          lastDays: 90,
          page: 1,
          pageSize: 10,
          lastVersion: true,
          pollUuid: 'poll-1',
        })
        .subscribe();

      const req = httpMock.expectOne(
        r => r.url === `${baseUrl}/poll-1` && r.params.get('days') === '90'
      );
      req.flush({});
    });

    it('should append one cohortId param per entry in cohortIds', () => {
      service
        .getPollInstancesByFilters({
          cohortIds: [1, 2, 3],
          page: 1,
          pageSize: 10,
          lastVersion: true,
          pollUuid: 'poll-1',
        })
        .subscribe();

      const req = httpMock.expectOne(
        r =>
          r.url === `${baseUrl}/poll-1` &&
          r.params.getAll('cohortId')?.join(',') === '1,2,3'
      );
      req.flush({});
    });

    it('should not append cohortId params when cohortIds is empty', () => {
      service
        .getPollInstancesByFilters({
          cohortIds: [],
          page: 1,
          pageSize: 10,
          lastVersion: true,
          pollUuid: 'poll-1',
        })
        .subscribe();

      const req = httpMock.expectOne(
        r => r.url === `${baseUrl}/poll-1` && !r.params.has('cohortId')
      );
      req.flush({});
    });

    it('should include evaluationId when truthy', () => {
      service
        .getPollInstancesByFilters({
          cohortIds: [],
          page: 1,
          pageSize: 10,
          lastVersion: true,
          pollUuid: 'poll-1',
          evaluationId: 99,
        })
        .subscribe();

      const req = httpMock.expectOne(
        r =>
          r.url === `${baseUrl}/poll-1` && r.params.get('evaluationId') === '99'
      );
      req.flush({});
    });

    it('should include evaluationId when it is a string', () => {
      service
        .getPollInstancesByFilters({
          cohortIds: [],
          page: 1,
          pageSize: 10,
          lastVersion: true,
          pollUuid: 'poll-1',
          evaluationId: 'eval-1',
        })
        .subscribe();

      const req = httpMock.expectOne(
        r =>
          r.url === `${baseUrl}/poll-1` &&
          r.params.get('evaluationId') === 'eval-1'
      );
      req.flush({});
    });

    it('should NOT include evaluationId when it is 0 (falsy check, differs from other services)', () => {
      service
        .getPollInstancesByFilters({
          cohortIds: [],
          page: 1,
          pageSize: 10,
          lastVersion: true,
          pollUuid: 'poll-1',
          evaluationId: 0,
        })
        .subscribe();

      const req = httpMock.expectOne(
        r => r.url === `${baseUrl}/poll-1` && !r.params.has('evaluationId')
      );
      req.flush({});
    });

    it('should not include evaluationId when not provided', () => {
      service
        .getPollInstancesByFilters({
          cohortIds: [],
          page: 1,
          pageSize: 10,
          lastVersion: true,
          pollUuid: 'poll-1',
        })
        .subscribe();

      const req = httpMock.expectOne(
        r => r.url === `${baseUrl}/poll-1` && !r.params.has('evaluationId')
      );
      req.flush({});
    });
  });

  describe('getAllPollInstances', () => {
    it('should make a GET request without params', () => {
      const mockResponse = {} as ServerResponse;

      service.getAllPollInstances().subscribe(res => {
        expect(res).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${baseUrl}/`);
      expect(req.request.method).toBe('GET');
      expect(req.request.params.keys().length).toBe(0);
      req.flush(mockResponse);
    });
  });

  describe('getComponentsAvgGroupedByCohorts', () => {
    it('should make a GET request to :pollUuid/cohorts/avg with lastVersion param', () => {
      const mockResponse = {} as ComponentsAvgGroupedByCohortsModel;

      service
        .getComponentsAvgGroupedByCohorts('poll-1', true)
        .subscribe(res => expect(res).toEqual(mockResponse));

      const req = httpMock.expectOne(
        r =>
          r.url === `${baseUrl}/poll-1/cohorts/avg` &&
          r.params.get('lastVersion') === 'true'
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });

  describe('getComponentsRiskByPollForStudent', () => {
    it('should make a GET request to :pollUuid/avg with studentId param', () => {
      const mockResponse: ComponentsAvgModel[] = [];

      service
        .getComponentsRiskByPollForStudent(7, 55)
        .subscribe(res => expect(res).toEqual(mockResponse));

      const req = httpMock.expectOne(
        r => r.url === `${baseUrl}/55/avg` && r.params.get('studentId') === '7'
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });
});
