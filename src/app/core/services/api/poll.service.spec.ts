import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { PollService } from './poll.service';
import { PollModel } from '../../models/poll.model';
import { PollVariableModel } from '../../models/poll-variable.model';
import { VariableModel } from '../../models/variable.model';
import { environment } from '../../../../environments/environment';

describe('PollService', () => {
  let service: PollService;
  let httpMock: HttpTestingController;

  const baseUrl = `${environment.apiUrl}/api/v1/polls`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [PollService],
    });
    service = TestBed.inject(PollService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getAllPolls', () => {
    it('should make a GET request and return polls sorted by name', () => {
      const mockResponse: PollModel[] = [
        { name: 'Zeta' } as PollModel,
        { name: 'Alpha' } as PollModel,
        { name: 'Mike' } as PollModel,
      ];

      service.getAllPolls().subscribe(res => {
        expect(res.map(p => p.name)).toEqual(['Alpha', 'Mike', 'Zeta']);
      });

      const req = httpMock.expectOne(`${baseUrl}/`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should cache the Observable and return the same reference on the second call', () => {
      const obs1 = service.getAllPolls();
      const obs2 = service.getAllPolls();

      expect(obs1).toBe(obs2);
    });

    it('should not create a new Observable if pollsCache$ already exists', () => {
      const fakeCache$ = service.getAllPolls();
      fakeCache$.subscribe();
      httpMock.expectOne(`${baseUrl}/`).flush([]);

      const getSpy = spyOn(service, 'get').and.callThrough();

      const result = service.getAllPolls();

      expect(result).toBe(fakeCache$);
      expect(getSpy).not.toHaveBeenCalled();
    });
  });

  describe('clearCache', () => {
    it('should reset pollsCache$ to null', () => {
      const obs1 = service.getAllPolls();
      obs1.subscribe();
      httpMock.expectOne(`${baseUrl}/`).flush([]);

      expect(service.pollsCache$).not.toBeNull();

      service.clearCache();

      expect(service.pollsCache$).toBeNull();
    });

    it('should force a new HTTP request after clearing the cache', () => {
      const mockResponse: PollModel[] = [{ name: 'Alpha' } as PollModel];

      const obs1 = service.getAllPolls();
      obs1.subscribe();
      httpMock.expectOne(`${baseUrl}/`).flush(mockResponse);

      service.clearCache();

      const obs2 = service.getAllPolls();
      obs2.subscribe(res => {
        expect(res.map(p => p.name)).toEqual(['Alpha']);
      });

      expect(obs2).not.toBe(obs1);

      const req = httpMock.expectOne(`${baseUrl}/`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });

  describe('getPollsByCohortId', () => {
    it('should make a GET request with CohortId param', () => {
      const mockResponse: PollModel[] = [{ name: 'Poll A' } as PollModel];

      service.getPollsByCohortId(5).subscribe(res => {
        expect(res).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(
        r => r.url === `${baseUrl}/` && r.params.get('CohortId') === '5'
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });

  describe('getByCohortAndPoll', () => {
    it('should make a GET request to :pollId with CohortId param', () => {
      const mockResponse: PollVariableModel[] = [];

      service
        .getByCohortAndPoll(5, 10)
        .subscribe(res => expect(res).toEqual(mockResponse));

      const req = httpMock.expectOne(
        r => r.url === `${baseUrl}/10` && r.params.get('CohortId') === '5'
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });

  describe('getPollsByStudentId', () => {
    it('should make a GET request with studentId param', () => {
      const mockResponse: PollModel[] = [{ name: 'Poll B' } as PollModel];

      service.getPollsByStudentId(20).subscribe(res => {
        expect(res).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(
        r => r.url === `${baseUrl}/` && r.params.get('studentId') === '20'
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });

  describe('getVariablesByComponents', () => {
    it('should append one component param per entry and lastVersion', () => {
      const mockResponse: VariableModel[] = [];

      service
        .getVariablesByComponents('poll-1', ['comp-a', 'comp-b'], true)
        .subscribe(res => expect(res).toEqual(mockResponse));

      const req = httpMock.expectOne(
        r =>
          r.url === `${baseUrl}/poll-1/variables` &&
          r.params.getAll('component')?.join(',') === 'comp-a,comp-b' &&
          r.params.get('lastVersion') === 'true'
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should send only lastVersion when components is empty', () => {
      service.getVariablesByComponents('poll-1', [], false).subscribe();

      const req = httpMock.expectOne(
        r =>
          r.url === `${baseUrl}/poll-1/variables` &&
          !r.params.has('component') &&
          r.params.get('lastVersion') === 'false'
      );
      req.flush([]);
    });
  });
});
