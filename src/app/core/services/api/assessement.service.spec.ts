import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { AssessmentModel } from '../../models/assessment.model';
import { environment } from '../../../../environments/environment';
import { AssessmentService } from './assessement.service';

describe('AssessmentService', () => {
  let service: AssessmentService;
  let httpMock: HttpTestingController;

  const baseUrl = `${environment.apiUrl}/api/v1/assessments`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AssessmentService],
    });
    service = TestBed.inject(AssessmentService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getAll', () => {
    it('should make a GET request to the correct URL and return the data', () => {
      const mockResponse: AssessmentModel[] = [
        { id: 1 } as unknown as AssessmentModel,
      ];

      service.getAll().subscribe(res => {
        expect(res).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${baseUrl}/`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should cache the Observable and return the same reference on the second call', () => {
      const obs1 = service.getAll();
      const obs2 = service.getAll();

      expect(obs1).toBe(obs2);
    });

    it('should not trigger a new HTTP request when subscribing twice to the cached observable (shareReplay)', () => {
      const mockResponse: AssessmentModel[] = [
        { id: 1 } as unknown as AssessmentModel,
      ];

      const obs$ = service.getAll();

      obs$.subscribe(res => expect(res).toEqual(mockResponse));
      const req = httpMock.expectOne(`${baseUrl}/`);
      req.flush(mockResponse);

      obs$.subscribe(res => expect(res).toEqual(mockResponse));
      httpMock.expectNone(`${baseUrl}/`);
    });

    it('should not create a new Observable if assessmentsCache$ already exists', () => {
      const fakeCache$ = service.getAll();
      fakeCache$.subscribe();
      httpMock.expectOne(`${baseUrl}/`).flush([]);

      const getSpy = spyOn(service, 'get').and.callThrough();

      const result = service.getAll();

      expect(result).toBe(fakeCache$);
      expect(getSpy).not.toHaveBeenCalled();
    });
  });

  describe('clearCache', () => {
    it('should force a new HTTP request after clearing the cache', () => {
      const mockResponse: AssessmentModel[] = [
        { id: 1 } as unknown as AssessmentModel,
      ];

      const obs1 = service.getAll();
      obs1.subscribe();
      httpMock.expectOne(`${baseUrl}/`).flush(mockResponse);

      service.clearCache();

      const obs2 = service.getAll();
      obs2.subscribe(res => {
        expect(res).toEqual(mockResponse);
      });

      expect(obs2).not.toBe(obs1);

      const req = httpMock.expectOne(`${baseUrl}/`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });

  describe('getById', () => {
    it('should make a GET request to the URL with the given id', () => {
      const mockResponse = { id: 1 } as unknown as AssessmentModel;

      service.getById('1').subscribe(res => {
        expect(res).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${baseUrl}/1`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });

  describe('createAssessment', () => {
    it('should make a POST request with the given assessment', () => {
      const newAssessment = { name: 'new' } as unknown as AssessmentModel;
      const mockResponse = { id: 1, name: 'new' } as unknown as AssessmentModel;

      service.createAssessment(newAssessment).subscribe(res => {
        expect(res).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${baseUrl}/`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(newAssessment);
      req.flush(mockResponse);
    });
  });

  describe('editAssessment', () => {
    it('should make a PUT request to the URL with the given id and assessment', () => {
      const editedAssessment = {
        id: 1,
        name: 'updated',
      } as unknown as AssessmentModel;

      service.editAssessment('1', editedAssessment).subscribe(res => {
        expect(res).toEqual(editedAssessment);
      });

      const req = httpMock.expectOne(`${baseUrl}/1`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(editedAssessment);
      req.flush(editedAssessment);
    });
  });

  describe('deleteAssessment', () => {
    it('should make a DELETE request to the URL with the given id', () => {
      service.deleteAssessment(1).subscribe();

      const req = httpMock.expectOne(`${baseUrl}/1`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });
  });
});
