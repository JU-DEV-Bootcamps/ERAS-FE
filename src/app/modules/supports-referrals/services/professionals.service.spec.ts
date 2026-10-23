import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { HttpParams, provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { ProfessionalsService } from './professionals.service';
import { AssignedProfessional } from '../models/referrals.interfaces';
import { PagedResult } from '@core/services/interfaces/page.type';

describe('ProfessionalsService', () => {
  let service: ProfessionalsService;
  let getSpy: jasmine.Spy;
  let postSpy: jasmine.Spy;

  const mockPagedResult: PagedResult<AssignedProfessional> = {
    items: [{ id: 1, name: 'Professional A' } as AssignedProfessional],
    count: 1,
  };

  const mockProfessional: AssignedProfessional = {
    id: 2,
    name: 'Professional B',
  } as AssignedProfessional;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(ProfessionalsService);

    getSpy = spyOn(
      service as unknown as {
        get: ProfessionalsService['getAllProfessionals'];
      },
      'get'
    ).and.returnValue(of(mockPagedResult));

    postSpy = spyOn(
      service as unknown as {
        post: ProfessionalsService['addNewProfessional'];
      },
      'post'
    ).and.returnValue(of(mockProfessional));
  });

  it('should create the service', () => {
    expect(service).toBeTruthy();
  });

  describe('getAllProfessionals', () => {
    it('should call get with no params when pagination is not provided', () => {
      service.getAllProfessionals().subscribe(result => {
        expect(result).toEqual(mockPagedResult);
      });

      expect(getSpy).toHaveBeenCalledWith('', undefined);
    });

    it('should build HttpParams with PageSize and Page when pagination is provided', () => {
      service.getAllProfessionals({ page: 2, pageSize: 10 }).subscribe();

      expect(getSpy).toHaveBeenCalledTimes(1);
      const paramsArg = getSpy.calls.mostRecent().args[1] as HttpParams;
      expect(paramsArg).toBeInstanceOf(HttpParams);
      expect(paramsArg.get('PageSize')).toBe('10');
      expect(paramsArg.get('Page')).toBe('2');
    });

    it('should cache the observable and not call get again on a second invocation', () => {
      service.getAllProfessionals().subscribe();
      service.getAllProfessionals().subscribe();
      service.getAllProfessionals({ page: 1, pageSize: 5 }).subscribe();

      expect(getSpy).toHaveBeenCalledTimes(1);
    });

    it('should share the same replayed value across multiple subscribers', () => {
      const results: PagedResult<AssignedProfessional>[] = [];
      const obs$ = service.getAllProfessionals();

      obs$.subscribe(res => results.push(res));
      obs$.subscribe(res => results.push(res));

      expect(getSpy).toHaveBeenCalledTimes(1);
      expect(results).toEqual([mockPagedResult, mockPagedResult]);
    });
  });

  describe('addNewProfessional', () => {
    it('should call post with the given professional and return the response', () => {
      service.addNewProfessional(mockProfessional).subscribe(result => {
        expect(result).toEqual(mockProfessional);
      });

      expect(postSpy).toHaveBeenCalledWith('', mockProfessional);
    });

    it('should invalidate the cache after a successful add, forcing a new get on next call', () => {
      service.getAllProfessionals().subscribe();
      expect(getSpy).toHaveBeenCalledTimes(1);

      service.addNewProfessional(mockProfessional).subscribe();

      service.getAllProfessionals().subscribe();
      expect(getSpy).toHaveBeenCalledTimes(2);
    });
  });

  describe('invalidateCache', () => {
    it('should force a new get call after being invoked manually', () => {
      service.getAllProfessionals().subscribe();
      expect(getSpy).toHaveBeenCalledTimes(1);

      service.invalidateCache();

      service.getAllProfessionals().subscribe();
      expect(getSpy).toHaveBeenCalledTimes(2);
    });
  });
});
