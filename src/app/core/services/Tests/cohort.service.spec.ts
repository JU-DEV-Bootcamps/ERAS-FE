import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
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
        provideHttpClient(), // provides real HttpClient
        provideHttpClientTesting() // mocks http request
      ]
    });

    httpMock = TestBed.inject(HttpTestingController);
    service = TestBed.inject(CohortService);
  });

  afterEach(() => {
    httpMock.verify();
/*
It is recommended to call httpMock.verify() at the end of the test
Verify that all expected requests have been completed, 
Prevent memory leaks between tests , 
to ensure that no requests were left unhandled
*/
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
  
  it('getCohorts should return expected data', () => {
    
  // Prepare mock data
    const mockCohortData :Cohort[] = [
        {
            "name": "Cohort 1 (Enero 2023)",
            "courseCode": "",
            "audit": {
                "createdBy": "Cosmic latte import",
                "modifiedBy": "",
                "createdAt": "2025-03-06T15:59:58.128383Z",
                "modifiedAt": "2025-03-06T15:59:58.128383Z"
            },
            "id": 177
        },
        {
            "name": "Cohort 3 (Enero 2024)",
            "courseCode": "",
            "audit": {
                "createdBy": "Cosmic latte import",
                "modifiedBy": "",
                "createdAt": "2025-03-06T15:59:59.138352Z",
                "modifiedAt": "2025-03-06T15:59:59.138353Z"
            },
            "id": 178
        }
    ]

    // We subscribe, so that when the call is made we can make the assertions.
    service.getCohorts().subscribe(data => {
      expect(data).toEqual(mockCohortData);
      expect(data.length).toBe(2);
      expect(data.length).toBeGreaterThan(0);
      expect(data[0].id).toBeDefined();
      expect(data[0].id).toBeInstanceOf(Number); 
      expect(data.every(cohort => 'name' in cohort)).toBeTrue();  
    });

    // Verifies that exactly one HTTP request has been made to the endpoint, that it is GET, and saves it in req so it can be sent to the observable
    const req = httpMock.expectOne(`${environment.apiUrl}/api/v1/Cohorts`);  
    expect(req.request.method).toBe('GET'); 
    
    // At the end we simulate the response of the endpoint using flush(), and the result is returned in the observable which is the one that executes the assertions.
    req.flush(mockCohortData);
    // req.flush(null, { status: 500, statusText: 'Internal Server Error' });
  }); 

  // Si tu servicio maneja errores, puedes probarlos as
  it('should handle HTTP error', () => {
    const errorResponse = new ErrorEvent('Error de red');
    
    service.getCohorts().subscribe({
      error: (error) => {
        expect(error).toBeDefined();
      }
    });
  
    const req = httpMock.expectOne(`${environment.apiUrl}/api/v1/Cohorts`);
    req.error(errorResponse);
  });

   
});