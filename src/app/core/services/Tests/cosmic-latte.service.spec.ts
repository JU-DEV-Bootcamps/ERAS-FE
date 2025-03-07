import { TestBed } from '@angular/core/testing';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { environment } from '../../../../environments/environment';
import { provideHttpClient } from '@angular/common/http';
import { CosmicLatteService } from '../cosmic-latte.service';
import { HealthCheckResponse } from '../../../shared/models/cosmic-latte/health-check.model';
import { PollInstance } from '../Types/cosmicLattePollImportList';
import { example_poll_instance } from './example-poll-instance';
import { pollNameResponse } from '../../../shared/models/pollNameRespose';

describe('Cohort Service test', () => {
  let service: CosmicLatteService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        CosmicLatteService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    httpMock = TestBed.inject(HttpTestingController);
    service = TestBed.inject(CosmicLatteService);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('healthCheck should response successfully', () => {
    const healthCheckResponse: HealthCheckResponse = {
      status: 'Healthy',
      totalDuration: '00:00:00.9912904',
      entries: {
        cosmicLatteApi: {
          data: {
            date: '07-03-2025 17:34hs',
            ResponseTime: 857,
            StatusCode: 'OK',
            ContentLength: 36982,
          },
          description: 'Cosmic Latte service is available',
          duration: '00:00:00.8721241',
          status: 'Healthy',
          tags: [],
        },
      },
    };
    service.healthCheck().subscribe((data: HealthCheckResponse) => {
      expect(data).toEqual(healthCheckResponse);
    });
    const req = httpMock.expectOne(`${environment.apiUrl}/api/v1/health`);
    expect(req.request.method).toBe('GET');
    req.flush(healthCheckResponse);
  });

  it('healthCheck should response successfully but cosmic latte is not working', done => {
    const healthCheckBadResponse: HealthCheckResponse = {
      status: 'Unhealthy',
      totalDuration: '00:00:00.9912904',
      entries: {
        cosmicLatteApi: {
          data: {
            date: '07-03-2025 17:34hs',
            ResponseTime: 857,
            StatusCode: 'Unauthorized',
            ContentLength: 36982,
          },
          description:
            'Cosmic Latte service returned an unsuccessful status code',
          duration: '00:00:00.8721241',
          status: 'Unhealthy',
          tags: [],
        },
      },
    };
    service.healthCheck().subscribe({
      next: (data: HealthCheckResponse) => {
        expect(data).toEqual(healthCheckBadResponse);
        done();
      },
      error: () => {
        fail('The request should have succeeded but failed');
        done();
      },
    });
    const req = httpMock.expectOne(`${environment.apiUrl}/api/v1/health`);
    expect(req.request.method).toBe('GET');
    req.flush(healthCheckBadResponse);
  });

  it('healthCheck should manage errors from server', done => {
    service.healthCheck().subscribe({
      next: () => fail('The request should have failed, but it succeeded'),
      error: (error: Error) => {
        expect(error).toBeDefined();
        expect(error.message).toBe('Error on health check');
        done();
      },
    });
    const req = httpMock.expectOne(`${environment.apiUrl}/api/v1/health`);
    req.flush('Some random server error', {
      status: 500,
      statusText: 'Internal Server Error',
    });
  });

  it('importAnswerBySurvey should response successfully sending only name', () => {
    const name = 'name';
    const response: PollInstance[] = [example_poll_instance];

    service.importAnswerBySurvey(name).subscribe((data: PollInstance[]) => {
      expect(data).toEqual(response);
    });
    const req = httpMock.expectOne(
      `${environment.apiUrl}/api/v1/CosmicLatte/polls?name=${name}`
    );
    expect(req.request.method).toBe('GET');
    req.flush(response);
  });

  it('importAnswerBySurvey should response successfully sending name, start and end date', () => {
    const name = 'name';
    const start = 'start';
    const end = 'end';
    const response: PollInstance[] = [example_poll_instance];

    service
      .importAnswerBySurvey(name, start, end)
      .subscribe((data: PollInstance[]) => {
        expect(data).toEqual(response);
      });
    const req = httpMock.expectOne(
      `${environment.apiUrl}/api/v1/CosmicLatte/polls?name=${name}&startDate=${start}&endDate=${end}`
    );
    expect(req.request.method).toBe('GET');
    req.flush(response);
  });

  it('importAnswerBySurvey should response successfully sending name, not found results', () => {
    const name = 'nameound';
    const response: PollInstance[] = [];

    service.importAnswerBySurvey(name).subscribe((data: PollInstance[]) => {
      expect(data).toEqual([]);
    });
    const req = httpMock.expectOne(
      `${environment.apiUrl}/api/v1/CosmicLatte/polls?name=${name}`
    );
    expect(req.request.method).toBe('GET');
    req.flush(response);
  });

  it('getPollNames should response and array of ', () => {
    const response: pollNameResponse[] = [
      {
        parent: 'evaluationSets:onGtcRz9ijpZDDcqX',
        name: 'Sample of evaluation',
        status: 'validated',
      },
    ];

    service.getPollNames().subscribe((data: pollNameResponse[]) => {
      expect(data).toEqual(response);
    });
    const req = httpMock.expectOne(
      `${environment.apiUrl}/api/v1/CosmicLatte/polls/names`
    );
    expect(req.request.method).toBe('GET');
    req.flush(response);
  });
});
