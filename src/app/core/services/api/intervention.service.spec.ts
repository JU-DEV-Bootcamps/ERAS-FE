import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import {
  InterventionService,
  AddInterventionPayload,
} from './intervention.service';
import { InterventionModel } from '@core/models/assessment.model';
import { environment } from '../../../../environments/environment';

describe('InterventionService', () => {
  let service: InterventionService;
  let httpMock: HttpTestingController;

  const baseUrl = `${environment.apiUrl}/api/v1/assessments`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [InterventionService],
    });
    service = TestBed.inject(InterventionService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getByAssessment', () => {
    it('should make a GET request to :assessmentId/interventions', () => {
      const mockResponse: InterventionModel[] = [
        { id: 1 } as unknown as InterventionModel,
      ];

      service.getByAssessment(10).subscribe(res => {
        expect(res).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${baseUrl}/10/interventions`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });

  describe('createIntervention', () => {
    it('should make a POST request to interventions with the given payload', () => {
      const payload: AddInterventionPayload = {
        assessmentId: 10,
        intervention: { type: 'follow-up' },
      };
      const mockResponse = { id: 1 } as unknown as InterventionModel;

      service.createIntervention(payload).subscribe(res => {
        expect(res).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${baseUrl}/interventions`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(payload);
      req.flush(mockResponse);
    });
  });

  describe('upsertInterventions', () => {
    it('should make a PUT request to :assessmentId/interventions with the given interventions', () => {
      const interventions: InterventionModel[] = [
        { id: 1 } as unknown as InterventionModel,
        { id: 2 } as unknown as InterventionModel,
      ];

      service.upsertInterventions(10, interventions).subscribe(res => {
        expect(res).toEqual(interventions);
      });

      const req = httpMock.expectOne(`${baseUrl}/10/interventions`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(interventions);
      req.flush(interventions);
    });
  });

  describe('updateIntervention', () => {
    it('should make a PUT request to :assessmentId/interventions/:interventionId', () => {
      const intervention = { id: 5 } as unknown as InterventionModel;

      service.updateIntervention(10, 5, intervention).subscribe(res => {
        expect(res).toEqual(intervention);
      });

      const req = httpMock.expectOne(`${baseUrl}/10/interventions/5`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(intervention);
      req.flush(intervention);
    });
  });

  describe('deleteIntervention', () => {
    it('should make a DELETE request to :assessmentId/interventions/:interventionId', () => {
      service.deleteIntervention(10, 5).subscribe();

      const req = httpMock.expectOne(`${baseUrl}/10/interventions/5`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });
  });

  describe('uploadAttachments', () => {
    it('should make a POST request with FormData to interventions/:interventionId/attachments', () => {
      const file1 = new File(['content1'], 'file1.pdf');
      const file2 = new File(['content2'], 'file2.pdf');
      const mockResponse = ['file1.pdf', 'file2.pdf'];

      service.uploadAttachments(5, [file1, file2]).subscribe(res => {
        expect(res).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${baseUrl}/interventions/5/attachments`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toBeInstanceOf(FormData);
      expect((req.request.body as FormData).getAll('files')).toEqual([
        file1,
        file2,
      ]);
      req.flush(mockResponse);
    });

    it('should send an empty FormData when no files are provided', () => {
      service.uploadAttachments(5, []).subscribe();

      const req = httpMock.expectOne(`${baseUrl}/interventions/5/attachments`);
      expect((req.request.body as FormData).getAll('files')).toEqual([]);
      req.flush([]);
    });
  });

  describe('downloadAttachment', () => {
    it('should make a GET request with responseType blob to the correct URL', () => {
      const mockBlob = new Blob(['file content'], { type: 'application/pdf' });

      service.downloadAttachment(5, 'report.pdf').subscribe(res => {
        expect(res).toEqual(mockBlob);
      });

      const req = httpMock.expectOne(
        `${baseUrl}/interventions/5/attachments/report.pdf`
      );
      expect(req.request.method).toBe('GET');
      expect(req.request.responseType).toBe('blob');
      req.flush(mockBlob);
    });
  });

  describe('deleteAttachment', () => {
    it('should make a DELETE request to interventions/:interventionId/attachments/:fileName', () => {
      service.deleteAttachment(5, 'report.pdf').subscribe();

      const req = httpMock.expectOne(
        `${baseUrl}/interventions/5/attachments/report.pdf`
      );
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });
  });
});
