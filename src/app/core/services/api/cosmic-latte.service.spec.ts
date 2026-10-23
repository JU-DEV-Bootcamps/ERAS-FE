import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { CosmicLatteService } from './cosmic-latte.service';
import { HealthCheckResponse } from '../../models/cosmic-latte-request.model';
import { PollName } from '../../models/poll-request.model';
import { PollInstance } from '../../models/poll-instance.model';
import {
  ImportJobItem,
  ImportJobStatusModel,
  QueuedImportResponse,
  StartExtractionRequest,
} from '../../models/import-job.model';
import { environment } from '../../../../environments/environment';

describe('CosmicLatteService', () => {
  let service: CosmicLatteService;
  let httpMock: HttpTestingController;

  const baseUrl = `${environment.apiUrl}/api/v1/cosmic-latte`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [CosmicLatteService],
    });
    service = TestBed.inject(CosmicLatteService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('healthCheck', () => {
    it('should make a GET request with ConfigurationId param and return the response', () => {
      const mockResponse = { status: 'ok' } as unknown as HealthCheckResponse;

      service.healthCheck(1).subscribe(res => {
        expect(res).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(
        r =>
          r.url === `${baseUrl}/health` &&
          r.params.get('ConfigurationId') === '1'
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should map any HTTP error to a generic "Error on health check" error', () => {
      let capturedError: Error | undefined;

      service.healthCheck(1).subscribe({
        next: () => fail('expected an error, not a success'),
        error: err => (capturedError = err),
      });

      const req = httpMock.expectOne(`${baseUrl}/health?ConfigurationId=1`);
      req.flush('server error', { status: 500, statusText: 'Server Error' });

      expect(capturedError).toBeTruthy();
      expect(capturedError?.message).toBe('Error on health check');
    });
  });

  describe('getPollNames', () => {
    it('should make a GET request with ConfigurationId param and return polls sorted by name', () => {
      const mockResponse: PollName[] = [
        { name: 'Zeta' } as PollName,
        { name: 'Alpha' } as PollName,
        { name: 'Mike' } as PollName,
      ];

      service.getPollNames(2).subscribe(res => {
        expect(res.map(p => p.name)).toEqual(['Alpha', 'Mike', 'Zeta']);
      });

      const req = httpMock.expectOne(
        r =>
          r.url === `${baseUrl}/polls/names` &&
          r.params.get('ConfigurationId') === '2'
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should map any HTTP error to a "Failed to fetch polls details" error', () => {
      let capturedError: Error | undefined;

      service.getPollNames(2).subscribe({
        next: () => fail('expected an error, not a success'),
        error: err => (capturedError = err),
      });

      const req = httpMock.expectOne(
        `${baseUrl}/polls/names?ConfigurationId=2`
      );
      req.flush('server error', { status: 500, statusText: 'Server Error' });

      expect(capturedError).toBeTruthy();
      expect(capturedError?.message).toBe('Failed to fetch polls details');
    });
  });

  describe('importAnswerBySurvey', () => {
    it('should send EvaluationSetName and ConfigurationId without dates when not provided', () => {
      const mockResponse: PollInstance[] = [];

      service
        .importAnswerBySurvey(3, 'survey-a')
        .subscribe(res => expect(res).toEqual(mockResponse));

      const req = httpMock.expectOne(
        r =>
          r.url === `${baseUrl}/polls` &&
          r.params.get('EvaluationSetName') === 'survey-a' &&
          r.params.get('ConfigurationId') === '3' &&
          !r.params.has('startDate') &&
          !r.params.has('endDate')
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should include startDate and endDate when both are provided', () => {
      service
        .importAnswerBySurvey(3, 'survey-a', '2026-01-01', '2026-01-31')
        .subscribe();

      const req = httpMock.expectOne(
        r =>
          r.url === `${baseUrl}/polls` &&
          r.params.get('startDate') === '2026-01-01' &&
          r.params.get('endDate') === '2026-01-31'
      );
      req.flush([]);
    });

    it('should omit startDate when it is an empty string', () => {
      service.importAnswerBySurvey(3, 'survey-a', '', '2026-01-31').subscribe();

      const req = httpMock.expectOne(
        r => r.url === `${baseUrl}/polls` && !r.params.has('startDate')
      );
      req.flush([]);
    });

    it('should omit endDate when it is null', () => {
      service
        .importAnswerBySurvey(3, 'survey-a', '2026-01-01', null)
        .subscribe();

      const req = httpMock.expectOne(
        r => r.url === `${baseUrl}/polls` && !r.params.has('endDate')
      );
      req.flush([]);
    });
  });

  describe('savePollsCosmicLattePreview', () => {
    it('should make a POST request to polls/:evaluationId with the given data', () => {
      const data: PollInstance[] = [{ id: 1 } as unknown as PollInstance];

      service.savePollsCosmicLattePreview(data, 42).subscribe(res => {
        expect(res).toEqual(data);
      });

      const req = httpMock.expectOne(`${baseUrl}/polls/42`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(data);
      req.flush(data);
    });
  });

  describe('startExtraction', () => {
    it('should make a POST request to imports/extract with the request body', () => {
      const request = {
        configurationId: 1,
      } as unknown as StartExtractionRequest;
      const mockResponse = { jobId: 100 } as unknown as QueuedImportResponse;

      service.startExtraction(request).subscribe(res => {
        expect(res).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${baseUrl}/imports/extract`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(request);
      req.flush(mockResponse);
    });
  });

  describe('confirmImport', () => {
    it('should make a POST request to imports/:importJobId/confirm with itemIds', () => {
      const itemIds = [1, 2, 3];
      const mockResponse = { jobId: 100 } as unknown as QueuedImportResponse;

      service.confirmImport(100, itemIds).subscribe(res => {
        expect(res).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${baseUrl}/imports/100/confirm`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ itemIds });
      req.flush(mockResponse);
    });
  });

  describe('getImportStatus', () => {
    it('should make a GET request to imports/:importJobId', () => {
      const mockResponse = {
        status: 'completed',
      } as unknown as ImportJobStatusModel;

      service.getImportStatus(100).subscribe(res => {
        expect(res).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${baseUrl}/imports/100`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });

  describe('getImportItems', () => {
    it('should make a GET request to imports/:importJobId/items', () => {
      const mockResponse: ImportJobItem[] = [
        { id: 1 } as unknown as ImportJobItem,
      ];

      service.getImportItems(100).subscribe(res => {
        expect(res).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${baseUrl}/imports/100/items`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });

  describe('retryImportItems', () => {
    it('should make a POST request to imports/:importJobId/retry with itemIds', () => {
      const itemIds = [4, 5];
      const mockResponse = { jobId: 100 } as unknown as QueuedImportResponse;

      service.retryImportItems(100, itemIds).subscribe(res => {
        expect(res).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${baseUrl}/imports/100/retry`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ itemIds });
      req.flush(mockResponse);
    });
  });
});
