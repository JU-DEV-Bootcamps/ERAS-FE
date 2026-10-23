import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { HttpParams } from '@angular/common/http';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { JuServicesService } from './juServices.service';
import { JuService } from '../models/referrals.interfaces';
import { PagedResult } from '@core/services/interfaces/page.type';

describe('JuServicesService', () => {
  let service: JuServicesService;
  let getSpy: jasmine.Spy;
  let postSpy: jasmine.Spy;

  const mockPagedResult: PagedResult<JuService> = {
    items: [{ id: 1, name: 'Service A' } as JuService],
    count: 1,
  };

  const mockService: JuService = { id: 2, name: 'Service B' } as JuService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(JuServicesService);

    getSpy = spyOn(
      service as unknown as { get: JuServicesService['getAllJuServices'] },
      'get'
    ).and.returnValue(of(mockPagedResult));

    postSpy = spyOn(
      service as unknown as { post: JuServicesService['addNewService'] },
      'post'
    ).and.returnValue(of(mockService));
  });

  describe('getAllJuServices', () => {
    it('should call get with no params when pagination is not provided', () => {
      service.getAllJuServices().subscribe(result => {
        expect(result).toEqual(mockPagedResult);
      });

      expect(getSpy).toHaveBeenCalledWith('', undefined);
    });

    it('should build HttpParams with PageSize and Page when pagination is provided', () => {
      service.getAllJuServices({ page: 2, pageSize: 10 }).subscribe();

      expect(getSpy).toHaveBeenCalledTimes(1);
      const paramsArg = getSpy.calls.mostRecent().args[1] as HttpParams;
      expect(paramsArg).toBeInstanceOf(HttpParams);
      expect(paramsArg.get('PageSize')).toBe('10');
      expect(paramsArg.get('Page')).toBe('2');
    });

    it('should cache the observable and not call get again on a second invocation', () => {
      service.getAllJuServices().subscribe();
      service.getAllJuServices().subscribe();
      service.getAllJuServices({ page: 1, pageSize: 5 }).subscribe();

      expect(getSpy).toHaveBeenCalledTimes(1);
    });

    it('should share the same replayed value across multiple subscribers', () => {
      const results: PagedResult<JuService>[] = [];
      const obs$ = service.getAllJuServices();

      obs$.subscribe(res => results.push(res));
      obs$.subscribe(res => results.push(res));

      expect(getSpy).toHaveBeenCalledTimes(1);
      expect(results).toEqual([mockPagedResult, mockPagedResult]);
    });
  });

  describe('addNewService', () => {
    it('should call post with the given service and return the response', () => {
      service.addNewService(mockService).subscribe(result => {
        expect(result).toEqual(mockService);
      });

      expect(postSpy).toHaveBeenCalledWith('', mockService);
    });

    it('should invalidate the cache after a successful add, forcing a new get on next call', () => {
      service.getAllJuServices().subscribe();
      expect(getSpy).toHaveBeenCalledTimes(1);

      service.addNewService(mockService).subscribe();

      service.getAllJuServices().subscribe();
      expect(getSpy).toHaveBeenCalledTimes(2);
    });
  });

  describe('invalidateCache', () => {
    it('should force a new get call after being invoked manually', () => {
      service.getAllJuServices().subscribe();
      expect(getSpy).toHaveBeenCalledTimes(1);

      service.invalidateCache();

      service.getAllJuServices().subscribe();
      expect(getSpy).toHaveBeenCalledTimes(2);
    });
  });
});
