import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { StudentService } from './student.service';
import { StudentResponse } from '../../models/student-request.model';
import {
  StudentImport,
  StudentRiskAverage,
} from '../interfaces/student.interface';
import { StudentModel } from '../../models/student.model';
import { Pagination, ServerResponse } from '../interfaces/server.type';
import { PagedResult } from '../interfaces/page.type';
import { StudentRiskResponse } from '../../models/cohort.model';
import { AnswerResponse } from '../../models/answer-request.model';
import { environment } from '../../../../environments/environment';

describe('StudentService', () => {
  let service: StudentService;
  let httpMock: HttpTestingController;

  const baseUrl = `${environment.apiUrl}/api/v1/students`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [StudentService],
    });
    service = TestBed.inject(StudentService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getStudentDetailsById', () => {
    it('should make a GET request to :studentId with PageSize and Page params', () => {
      const pagination: Pagination = { page: 1, pageSize: 10 } as Pagination;
      const mockResponse = {} as StudentResponse;

      service
        .getStudentDetailsById(5, pagination)
        .subscribe(res => expect(res).toEqual(mockResponse));

      const req = httpMock.expectOne(
        r =>
          r.url === `${baseUrl}/5` &&
          r.params.get('PageSize') === '10' &&
          r.params.get('Page') === '1'
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });

  describe('getAllStudents', () => {
    it('should make a GET request with PageSize=9999 and Page=0', () => {
      const mockResponse = {} as PagedResult<StudentModel>;

      service.getAllStudents().subscribe(res => {
        expect(res).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(
        r =>
          r.url === `${baseUrl}/` &&
          r.params.get('PageSize') === '9999' &&
          r.params.get('Page') === '0'
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });

  describe('getAllAverageByCohortsAndPoll', () => {
    it('should send base params and return items sorted by studentName', () => {
      const mockResponse = {
        items: [
          { studentName: 'Zeta' } as StudentRiskAverage,
          { studentName: 'Alpha' } as StudentRiskAverage,
        ],
      } as unknown as PagedResult<StudentRiskAverage>;

      service
        .getAllAverageByCohortsAndPoll({
          cohortIds: [1, 2],
          page: 1,
          pageSize: 10,
          pollUuid: 'poll-1',
          lastVersion: true,
        })
        .subscribe(res => {
          expect(res.items.map(i => i.studentName)).toEqual(['Alpha', 'Zeta']);
        });

      const req = httpMock.expectOne(
        r =>
          r.url === `${baseUrl}/average` &&
          r.params.get('cohortIds') === '1,2' &&
          r.params.get('pollUuid') === 'poll-1' &&
          r.params.get('page') === '1' &&
          r.params.get('pageSize') === '10' &&
          r.params.get('lastVersion') === 'true'
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should include evaluationId when provided as a non-empty value', () => {
      service
        .getAllAverageByCohortsAndPoll({
          cohortIds: [],
          page: 1,
          pageSize: 10,
          pollUuid: 'poll-1',
          lastVersion: true,
          evaluationId: 42,
        })
        .subscribe();

      const req = httpMock.expectOne(
        r =>
          r.url === `${baseUrl}/average` &&
          r.params.get('evaluationId') === '42'
      );
      req.flush({ items: [] });
    });

    it('should include evaluationId when it is 0 (avoid falsy bug)', () => {
      service
        .getAllAverageByCohortsAndPoll({
          cohortIds: [],
          page: 1,
          pageSize: 10,
          pollUuid: 'poll-1',
          lastVersion: true,
          evaluationId: 0,
        })
        .subscribe();

      const req = httpMock.expectOne(
        r =>
          r.url === `${baseUrl}/average` && r.params.get('evaluationId') === '0'
      );
      req.flush({ items: [] });
    });

    it('should not include evaluationId when it is an empty string', () => {
      service
        .getAllAverageByCohortsAndPoll({
          cohortIds: [],
          page: 1,
          pageSize: 10,
          pollUuid: 'poll-1',
          lastVersion: true,
          evaluationId: '',
        })
        .subscribe();

      const req = httpMock.expectOne(
        r => r.url === `${baseUrl}/average` && !r.params.has('evaluationId')
      );
      req.flush({ items: [] });
    });

    it('should not include evaluationId when not provided', () => {
      service
        .getAllAverageByCohortsAndPoll({
          cohortIds: [],
          page: 1,
          pageSize: 10,
          pollUuid: 'poll-1',
          lastVersion: true,
        })
        .subscribe();

      const req = httpMock.expectOne(
        r => r.url === `${baseUrl}/average` && !r.params.has('evaluationId')
      );
      req.flush({ items: [] });
    });
  });

  describe('postData', () => {
    it('should make a POST request with the given data', () => {
      const data: StudentImport[] = [{ id: 1 } as unknown as StudentImport];
      const mockResponse = {} as ServerResponse;

      service.postData(data).subscribe(res => {
        expect(res).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${baseUrl}/`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(data);
      req.flush(mockResponse);
    });
  });

  describe('getData', () => {
    it('should use default page=1 and pageSize=10, returning items sorted by name', () => {
      const mockResponse = {
        items: [
          { name: 'Zeta' } as StudentModel,
          { name: 'Alpha' } as StudentModel,
        ],
      } as unknown as PagedResult<StudentModel>;

      service.getData({} as Pagination).subscribe(res => {
        expect(res.items.map(i => i.name)).toEqual(['Alpha', 'Zeta']);
      });

      const req = httpMock.expectOne(
        r =>
          r.url === `${baseUrl}/` &&
          r.params.get('PageSize') === '10' &&
          r.params.get('Page') === '1'
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should use the provided page and pageSize when given', () => {
      service.getData({ page: 3, pageSize: 50 } as Pagination).subscribe();

      const req = httpMock.expectOne(
        r =>
          r.url === `${baseUrl}/` &&
          r.params.get('PageSize') === '50' &&
          r.params.get('Page') === '3'
      );
      req.flush({ items: [] });
    });
  });

  describe('getDataStudentsByPoll', () => {
    it('should use default days=30, pollUuid empty, page=1, pageSize=10', () => {
      const mockResponse = {} as ServerResponse;

      service.getDataStudentsByPoll({}).subscribe(res => {
        expect(res).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(
        r =>
          r.url === `${baseUrl}/poll/` &&
          r.params.get('days') === '30' &&
          r.params.get('PageSize') === '10' &&
          r.params.get('Page') === '1'
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should use the provided days, pollUuid, page and pageSize', () => {
      service
        .getDataStudentsByPoll({
          days: 7,
          pollUuid: 'poll-1',
          page: 2,
          pageSize: 25,
        })
        .subscribe();

      const req = httpMock.expectOne(
        r =>
          r.url === `${baseUrl}/poll/poll-1` &&
          r.params.get('days') === '7' &&
          r.params.get('PageSize') === '25' &&
          r.params.get('Page') === '2'
      );
      req.flush({});
    });
  });

  describe('getPollComponentTopStudents', () => {
    it('should make a GET request to polls/:pollUuid/components/top with all params', () => {
      const mockResponse = {} as PagedResult<StudentRiskResponse>;

      service
        .getPollComponentTopStudents('poll-1', 'comp-a', 5, true, 10, 1)
        .subscribe(res => expect(res).toEqual(mockResponse));

      const req = httpMock.expectOne(
        r =>
          r.url === `${baseUrl}/polls/poll-1/components/top` &&
          r.params.get('componentName') === 'comp-a' &&
          r.params.get('cohortId') === '5' &&
          r.params.get('LastVersion') === 'true' &&
          r.params.get('PageSize') === '10' &&
          r.params.get('Page') === '1'
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });

  describe('getPollTopStudents', () => {
    it('should make a GET request to polls/:pollUuid/top with all params', () => {
      const mockResponse = {} as PagedResult<StudentRiskResponse>;

      service
        .getPollTopStudents('poll-1', 5, true, 10, 1)
        .subscribe(res => expect(res).toEqual(mockResponse));

      const req = httpMock.expectOne(
        r =>
          r.url === `${baseUrl}/polls/poll-1/top` &&
          r.params.get('CohortId') === '5' &&
          r.params.get('LastVersion') === 'true' &&
          r.params.get('PageSize') === '10' &&
          r.params.get('Page') === '1'
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });

  describe('getPollStudentsRiskSum', () => {
    it('should make a GET request to polls/:pollUuid/sum with cohortId param', () => {
      const mockResponse: StudentRiskResponse[] = [];

      service
        .getPollStudentsRiskSum('poll-1', 5)
        .subscribe(res => expect(res).toEqual(mockResponse));

      const req = httpMock.expectOne(
        r =>
          r.url === `${baseUrl}/polls/poll-1/sum` &&
          r.params.get('cohortId') === '5'
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });

  describe('getStudentAnswersByPoll', () => {
    it('should make a GET request to :studentId/polls/:pollId/answers with pagination params', () => {
      const pagination: Pagination = { page: 1, pageSize: 10 } as Pagination;
      const mockResponse = {} as PagedResult<AnswerResponse>;

      service
        .getStudentAnswersByPoll(3, 7, pagination)
        .subscribe(res => expect(res).toEqual(mockResponse));

      const req = httpMock.expectOne(
        r =>
          r.url === `${baseUrl}/3/polls/7/answers` &&
          r.params.get('PageSize') === '10' &&
          r.params.get('Page') === '1'
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });

  describe('getTopRiskStudents', () => {
    it('should make a GET request to /polls/:pollUuid/top with CohortId param', () => {
      const mockResponse: StudentRiskResponse[] = [];

      service
        .getTopRiskStudents('poll-1', 5)
        .subscribe(res => expect(res).toEqual(mockResponse));

      const req = httpMock.expectOne(
        r =>
          r.url === `${baseUrl}//polls/poll-1/top` &&
          r.params.get('CohortId') === '5'
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });

  describe('getTopRiskStudentsByComponent', () => {
    it('should make a GET request to /polls/:pollUuid/components/top with all params', () => {
      const mockResponse: StudentRiskResponse[] = [];

      service
        .getTopRiskStudentsByComponent('poll-1', 'comp-a', 5, 10, 1)
        .subscribe(res => expect(res).toEqual(mockResponse));

      const req = httpMock.expectOne(
        r =>
          r.url === `${baseUrl}//polls/poll-1/components/top` &&
          r.params.get('ComponentName') === 'comp-a' &&
          r.params.get('CohortId') === '5' &&
          r.params.get('PageSize') === '10' &&
          r.params.get('Page') === '1'
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });
});
