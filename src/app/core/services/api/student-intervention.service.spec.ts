import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';

import { environment } from '../../../../environments/environment';
import {
  SaveStudentInterventionModel,
  StudentInterventionModel,
} from '@core/models/student-intervention.model';
import { StudentInterventionService } from './student-intervention.service';

describe('StudentInterventionService', () => {
  let service: StudentInterventionService;
  let httpMock: HttpTestingController;

  const baseUrl = `${environment.apiUrl}/api/v1/students`;
  const entry: SaveStudentInterventionModel = {
    kind: 'RiskIdentified',
    type: 'Academic',
    description: 'Failed two midterms',
    entryDate: '2026-10-20',
  };
  const saved: StudentInterventionModel = {
    id: 10,
    studentId: 1,
    ...entry,
    createdBy: 'ana-sub',
    createdByName: 'Ana Pérez',
    createdAt: '2026-10-20T09:00:00Z',
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(StudentInterventionService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('gets the entries of a student from students/:id/interventions', () => {
    let result: StudentInterventionModel[] | undefined;
    service.getByStudent(1).subscribe(entries => (result = entries));

    const request = httpMock.expectOne(`${baseUrl}/1/interventions`);
    expect(request.request.method).toBe('GET');
    request.flush([saved]);

    expect(result).toEqual([saved]);
  });

  it('creates an entry with a POST to students/:id/interventions', () => {
    let result: StudentInterventionModel | undefined;
    service.create(1, entry).subscribe(created => (result = created));

    const request = httpMock.expectOne(`${baseUrl}/1/interventions`);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(entry);
    request.flush(saved);

    expect(result).toEqual(saved);
  });

  it('updates an entry with a PUT to students/:id/interventions/:entryId', () => {
    service.update(1, 10, entry).subscribe();

    const request = httpMock.expectOne(`${baseUrl}/1/interventions/10`);
    expect(request.request.method).toBe('PUT');
    expect(request.request.body).toEqual(entry);
    request.flush(saved);
  });

  it('deletes an entry with a DELETE to students/:id/interventions/:entryId', () => {
    service.remove(1, 10).subscribe();

    const request = httpMock.expectOne(`${baseUrl}/1/interventions/10`);
    expect(request.request.method).toBe('DELETE');
    request.flush(null);
  });
});
