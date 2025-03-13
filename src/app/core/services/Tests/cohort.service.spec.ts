import { TestBed } from '@angular/core/testing';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { environment } from '../../../../environments/environment';
import { CohortService } from '../cohort.service';
import { Cohort } from '../../../shared/models/Cohort';
import { provideHttpClient } from '@angular/common/http';

describe('Cohort Service test', () => {
  let service: CohortService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        CohortService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    httpMock = TestBed.inject(HttpTestingController);
    service = TestBed.inject(CohortService);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('getCohorts should return expected data', () => {
    const mockCohortData: Cohort[] = [
      {
        name: 'Cohort 1 (Enero 2023)',
        courseCode: '',
        audit: {
          createdBy: 'Cosmic latte import',
          modifiedBy: '',
          createdAt: '2025-03-06T15:59:58.128383Z',
          modifiedAt: '2025-03-06T15:59:58.128383Z',
        },
        id: 177,
      },
      {
        name: 'Cohort 3 (Enero 2024)',
        courseCode: '',
        audit: {
          createdBy: 'Cosmic latte import',
          modifiedBy: '',
          createdAt: '2025-03-06T15:59:59.138352Z',
          modifiedAt: '2025-03-06T15:59:59.138353Z',
        },
        id: 178,
      },
    ];

    service.getCohorts().subscribe(data => {
      expect(data).toEqual(mockCohortData);
      expect(data.length).toBe(2);
      expect(data.length).toBeGreaterThan(1);
      expect(data[0].id).toBeDefined();
      expect(data[0].id).toBeInstanceOf(Number);

      expect(data[0]).toEqual(
        jasmine.objectContaining({
          id: jasmine.any(Number),
          name: jasmine.any(String),
          audit: jasmine.any(Object),
        })
      );
      expect(data.every(cohort => 'name' in cohort)).toBeTrue();
    });
    const req = httpMock.expectOne(`${environment.apiUrl}/api/v1/Cohorts`);
    expect(req.request.method).toBe('GET');
    req.flush(mockCohortData);
  });
});
