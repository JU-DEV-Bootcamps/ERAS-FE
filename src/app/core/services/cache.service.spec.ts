import { TestBed } from '@angular/core/testing';

import { CacheService } from './cache.service';

describe('CacheService', () => {
  let service: CacheService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CacheService);

    service.clearAllCachedData();
    service.setCachedData<number>('test', 1);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get the cached data', () => {
    const cachedData = service.getCachedData<number>('test');

    expect(cachedData).toBe(1);
  });

  it('should return null if there is no cached data with the provided key', () => {
    const cachedData = service.getCachedData<string>('non-existing');

    expect(cachedData).toBeNull();
  });

  it('should return null if cached data exceeds timeToLive', () => {
    const time = Date.now() + 6 * 60 * 1000;
    jasmine.clock().mockDate(new Date(time));

    const cachedData = service.getCachedData<number>('test');
    expect(cachedData).toBeNull();
  });

  it('should return null if cached data Map is empty', () => {
    service.clearAllCachedData();

    const cachedData = service.getCachedData<number>('test');

    expect(cachedData).toBeNull();
  });

  it('should add new cached data', () => {
    service.setCachedData<number>('second', 2);

    const cachedData = service.getCachedData<number>('second');

    expect(service['_cachedData'].size).toBe(2);
    expect(cachedData).not.toBeNull();
  });

  it('should replace existing cached data', () => {
    service.setCachedData<number>('test', 3);

    const cachedData = service.getCachedData<number>('test');

    expect(cachedData).toBe(3);
  });

  it('should remove cached data', () => {
    service.invalidateCachedData('test');

    const cachedData = service.getCachedData('test');

    expect(cachedData).toBeNull();
    expect(service['_cachedData'].size).toBe(0);
  });

  it('should clean all cached data', () => {
    service.clearAllCachedData();

    const cachedData = service.getCachedData('test');

    expect(cachedData).toBeNull();
    expect(service['_cachedData'].size).toBe(0);
  });
});
