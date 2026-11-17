import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { environment } from '../../../../environments/environment';
import { UserManualsApiError } from '@core/models/user-manual-error.model';
import { UserManualsApiService } from './user-manuals.service';

describe('UserManualsApiService', () => {
  let service: UserManualsApiService;
  let http: HttpTestingController;
  const baseUrl = `${environment.apiUrl}/api/v1/manuals`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(UserManualsApiService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  const failure = (): { status: number; statusText: string } => ({
    status: 500,
    statusText: 'Server Error',
  });

  it('should turn a JSON error body of the list into the code it carries', done => {
    service.list().subscribe({
      error: (error: unknown) => {
        expect(error).toBeInstanceOf(UserManualsApiError);
        expect((error as UserManualsApiError).code).toBe(
          'manuals_manifest_missing'
        );
        done();
      },
    });

    http
      .expectOne(`${baseUrl}/`)
      .flush({ code: 'manuals_manifest_missing', message: 'x' }, failure());
  });

  it('should read the code from the Blob error body of a download', done => {
    service.download('student-guide').subscribe({
      error: (error: unknown) => {
        expect((error as UserManualsApiError).code).toBe(
          'manuals_file_missing'
        );
        done();
      },
    });

    http
      .expectOne(`${baseUrl}/student-guide/download`)
      .flush(
        new Blob([
          JSON.stringify({ code: 'manuals_file_missing', message: 'x' }),
        ]),
        failure()
      );
  });

  it('should leave the code empty for an unknown code or a body that is not JSON', done => {
    service.download('student-guide').subscribe({
      error: (error: unknown) => {
        expect((error as UserManualsApiError).code).toBeNull();
        done();
      },
    });

    http
      .expectOne(`${baseUrl}/student-guide/download`)
      .flush(new Blob(['<html>Bad gateway</html>']), failure());
  });
});
