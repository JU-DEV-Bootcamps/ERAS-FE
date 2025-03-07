import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';

import { provideHttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { ImportStudentService } from '../import-students.service';
import { PagedStudentResult } from '../../../shared/models/PagedStudentResult';
import { environment } from '../../../../environments/environment';

describe('Import Student Service', () => {
  let service: ImportStudentService;
  let httpMock: HttpTestingController;
  const apiUrl = environment.apiUrl;
  const endpoint = 'api/v1/Students';

  const data: PagedStudentResult = {
    count: 0,
    items: [],
  };

  const page = 0;
  const pageSize = 5;
  const pagedRequest = { page, pageSize };
  const postDataMock = { name: 'John Doe' };
  const postResponseMock = { success: true };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ImportStudentService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    httpMock = TestBed.inject(HttpTestingController);
    service = TestBed.inject(ImportStudentService);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('getAllStudents should retrieve a paginated result', () => {
    service.getData(pagedRequest).subscribe(data => {
      expect(data.items).toEqual([]);
      expect(data.count).toBeGreaterThanOrEqual(0);
    });
    const req = httpMock.expectOne(
      `${apiUrl}/${endpoint}?PageSize=${pageSize}&Page=${page}`
    );
    req.flush(data);
  });

  it('should send data using postData()', () => {
    service.postData(postDataMock).subscribe(response => {
      expect(response).toEqual(postResponseMock);
    });

    const req = httpMock.expectOne(`${apiUrl}/${endpoint}`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(postDataMock);

    req.flush(postResponseMock);
  });
});
