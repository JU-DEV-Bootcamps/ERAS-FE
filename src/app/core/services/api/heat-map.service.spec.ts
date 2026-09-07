import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { HeatMapService } from './heat-map.service';
import { PollData } from '../../../modules/reports/models/data.adapter';
import {
  RiskStudentDetailType,
  Components,
} from '../../models/types/risk-students-detail.type';
import { DEFAULT_LIMIT } from '../../constants/pagination';
import { GetQueryResponse } from '../../models/summary.model';
import { HeatmapSummaryModel } from '../../models/heatmap-summary.model';
import { SummaryHeatMapData } from '../../models/heatmap-data.model';
import { environment } from '../../../../environments/environment';

describe('HeatMapService', () => {
  let service: HeatMapService;
  let httpMock: HttpTestingController;

  const baseUrl = `${environment.apiUrl}/api/v1/heat-map`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [HeatMapService],
    });
    service = TestBed.inject(HeatMapService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getDataPoll', () => {
    it('should make a GET request to polls/:pollUUID and extract response.body', () => {
      const mockBody: PollData[] = [{ id: '1' } as unknown as PollData];

      service.getDataPoll('poll-1').subscribe(res => {
        expect(res).toEqual(mockBody);
      });

      const req = httpMock.expectOne(`${baseUrl}/polls/poll-1`);
      expect(req.request.method).toBe('GET');
      req.flush({ body: mockBody });
    });

    it('should cache the poll data after the first fetch', () => {
      const mockBody: PollData[] = [{ id: '1' } as unknown as PollData];

      service.getDataPoll('poll-1').subscribe();
      httpMock.expectOne(`${baseUrl}/polls/poll-1`).flush({ body: mockBody });

      service.getDataPoll('poll-1').subscribe(res => {
        expect(res).toEqual(mockBody);
      });

      httpMock.expectNone(`${baseUrl}/polls/poll-1`);
    });

    it('should make separate requests for different pollUUIDs', () => {
      const mockBodyA: PollData[] = [{ id: 'a' } as unknown as PollData];
      const mockBodyB: PollData[] = [{ id: 'b' } as unknown as PollData];

      service.getDataPoll('poll-a').subscribe(res => {
        expect(res).toEqual(mockBodyA);
      });
      httpMock.expectOne(`${baseUrl}/polls/poll-a`).flush({ body: mockBodyA });

      service.getDataPoll('poll-b').subscribe(res => {
        expect(res).toEqual(mockBodyB);
      });
      httpMock.expectOne(`${baseUrl}/polls/poll-b`).flush({ body: mockBodyB });
    });
  });

  describe('getSummaryData', () => {
    it('should make a GET request to polls/:pollId/summary', () => {
      const mockResponse = {} as GetQueryResponse<HeatmapSummaryModel>;

      service.getSummaryData('poll-1').subscribe(res => {
        expect(res).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${baseUrl}/polls/poll-1/summary`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });

  describe('getStudentHeatMapDetails', () => {
    it('should send component and the given limit as params', () => {
      const mockResponse: RiskStudentDetailType[] = [];

      service
        .getStudentHeatMapDetails(Components.ACADEMIC, 50)
        .subscribe(res => {
          expect(res).toEqual(mockResponse);
        });

      const req = httpMock.expectOne(
        r =>
          r.url === `${baseUrl}/details` &&
          r.params.get('component') === Components.ACADEMIC &&
          r.params.get('limit') === '50'
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should use DEFAULT_LIMIT when limit is not provided', () => {
      service.getStudentHeatMapDetails(Components.ACADEMIC).subscribe();

      const req = httpMock.expectOne(
        r =>
          r.url === `${baseUrl}/details` &&
          r.params.get('limit') === DEFAULT_LIMIT.toString()
      );
      req.flush([]);
    });

    it('should use DEFAULT_LIMIT when limit is null', () => {
      service.getStudentHeatMapDetails(Components.ACADEMIC, null).subscribe();

      const req = httpMock.expectOne(
        r =>
          r.url === `${baseUrl}/details` &&
          r.params.get('limit') === DEFAULT_LIMIT.toString()
      );
      req.flush([]);
    });

    it('should use the given limit when it is 0 (avoid falsy bug)', () => {
      service.getStudentHeatMapDetails(Components.ACADEMIC, 0).subscribe();

      const req = httpMock.expectOne(
        r => r.url === `${baseUrl}/details` && r.params.get('limit') === '0'
      );
      req.flush([]);
    });
  });

  describe('getSummaryDataByCohortAndDays', () => {
    it('should make a GET request to cohorts/:cohortId/summary with days param', () => {
      const mockResponse = { total: 5 };

      service.getSummaryDataByCohortAndDays('cohort-1', '7').subscribe(res => {
        expect(res).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(
        r =>
          r.url === `${baseUrl}/cohorts/cohort-1/summary` &&
          r.params.get('days') === '7'
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });

  describe('getStudentHeatMapDetailsByCohort', () => {
    it('should send the given limit as a param', () => {
      const mockResponse: RiskStudentDetailType[] = [];

      service
        .getStudentHeatMapDetailsByCohort('cohort-1', 30)
        .subscribe(res => expect(res).toEqual(mockResponse));

      const req = httpMock.expectOne(
        r =>
          r.url === `${baseUrl}/cohorts/cohort-1/top` &&
          r.params.get('limit') === '30'
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should use DEFAULT_LIMIT when limit is not provided', () => {
      service.getStudentHeatMapDetailsByCohort('cohort-1').subscribe();

      const req = httpMock.expectOne(
        r =>
          r.url === `${baseUrl}/cohorts/cohort-1/top` &&
          r.params.get('limit') === DEFAULT_LIMIT.toString()
      );
      req.flush([]);
    });

    it('should use DEFAULT_LIMIT when limit is null', () => {
      service.getStudentHeatMapDetailsByCohort('cohort-1', null).subscribe();

      const req = httpMock.expectOne(
        r =>
          r.url === `${baseUrl}/cohorts/cohort-1/top` &&
          r.params.get('limit') === DEFAULT_LIMIT.toString()
      );
      req.flush([]);
    });

    it('should use the given limit when it is 0 (avoid falsy bug)', () => {
      service.getStudentHeatMapDetailsByCohort('cohort-1', 0).subscribe();

      const req = httpMock.expectOne(
        r =>
          r.url === `${baseUrl}/cohorts/cohort-1/top` &&
          r.params.get('limit') === '0'
      );
      req.flush([]);
    });
  });

  describe('generateHeatmap', () => {
    it('should make a POST request with pollInstanceUuid, cohortId and variablesIds', () => {
      const mockResponse: SummaryHeatMapData[] = [];

      service
        .generateHeatmap('instance-1', [1, 2, 3], 10)
        .subscribe(res => expect(res).toEqual(mockResponse));

      const req = httpMock.expectOne(`${baseUrl}/`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({
        pollInstanceUuid: 'instance-1',
        cohortId: 10,
        variablesIds: [1, 2, 3],
      });
      req.flush(mockResponse);
    });

    it('should make a POST request without cohortId when not provided', () => {
      service.generateHeatmap('instance-1', [1, 2, 3]).subscribe();

      const req = httpMock.expectOne(`${baseUrl}/`);
      expect(req.request.body).toEqual({
        pollInstanceUuid: 'instance-1',
        cohortId: undefined,
        variablesIds: [1, 2, 3],
      });
      req.flush([]);
    });
  });
});
