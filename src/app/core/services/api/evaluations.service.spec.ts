import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { EvaluationsService } from './evaluations.service';
import {
  CreateEvaluationModel,
  PagedReadEvaluationProcess,
} from '../../models/evaluation-request.model';
import { EvaluationModel } from '../../models/evaluation.model';
import { GetQueryResponse } from '../../models/summary.model';
import { Pagination } from '../interfaces/server.type';
import { environment } from '../../../../environments/environment';

describe('EvaluationsService', () => {
  let service: EvaluationsService;
  let httpMock: HttpTestingController;

  const baseUrl = `${environment.apiUrl}/api/v1/evaluations`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [EvaluationsService],
    });
    service = TestBed.inject(EvaluationsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getEvalProcDetails', () => {
    it('should make a GET request to the URL with the given id', () => {
      const mockResponse = {} as GetQueryResponse<EvaluationModel>;

      service.getEvalProcDetails(5).subscribe(res => {
        expect(res).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${baseUrl}/5`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });

  describe('createEvalProc', () => {
    it('should make a POST request to the parentId URL with the given data', () => {
      const data: CreateEvaluationModel = {
        name: 'new evaluation',
        startDate: new Date('2026-01-01'),
        endDate: new Date('2026-01-31'),
        configurationId: 1,
      };
      const mockResponse: CreateEvaluationModel = { ...data };

      service.createEvalProc(data, 'parent-1').subscribe(res => {
        expect(res).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${baseUrl}/parent-1`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(data);
      req.flush(mockResponse);
    });
  });

  describe('getAllEvalProc', () => {
    it('should make a GET request without params when pagination is not provided', () => {
      const mockResponse = {} as PagedReadEvaluationProcess;

      service.getAllEvalProc().subscribe(res => {
        expect(res).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${baseUrl}/`);
      expect(req.request.method).toBe('GET');
      expect(req.request.params.keys().length).toBe(0);
      req.flush(mockResponse);
    });

    it('should include PageSize and Page params when pagination is provided', () => {
      const pagination: Pagination = { page: 2, pageSize: 20 } as Pagination;

      service.getAllEvalProc(pagination).subscribe();

      const req = httpMock.expectOne(
        r =>
          r.url === `${baseUrl}/` &&
          r.params.get('PageSize') === '20' &&
          r.params.get('Page') === '2'
      );
      expect(req.request.method).toBe('GET');
      req.flush({});
    });
  });

  describe('updateEvaluationProcess', () => {
    it('should make a PUT request to the URL with the evaluation id and body', () => {
      const evaluation = {
        id: 7,
        name: 'updated',
      } as unknown as EvaluationModel;

      service.updateEvaluationProcess(evaluation).subscribe(res => {
        expect(res).toEqual(evaluation);
      });

      const req = httpMock.expectOne(`${baseUrl}/7`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(evaluation);
      req.flush(evaluation);
    });
  });

  describe('deleteEvaluationProcess', () => {
    it('should make a DELETE request to the URL with the given id', () => {
      service.deleteEvaluationProcess('9').subscribe();

      const req = httpMock.expectOne(`${baseUrl}/9`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });
  });
});
