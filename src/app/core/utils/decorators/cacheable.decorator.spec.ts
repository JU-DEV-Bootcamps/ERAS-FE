import { Observable, of } from 'rxjs';
import { Cacheable } from './cacheable.decorator';

describe('Cacheable Decorator', () => {
  let cacheServiceSpy: jasmine.SpyObj<{
    getCachedData: (key: string) => unknown;
    setCachedData: (key: string, data: unknown) => void;
  }>;
  let hostObj: { cacheService?: typeof cacheServiceSpy };
  let originalFnSpy: jasmine.Spy;
  let descriptor: PropertyDescriptor;

  beforeEach(() => {
    cacheServiceSpy = jasmine.createSpyObj('CacheService', [
      'getCachedData',
      'setCachedData',
    ]);
    originalFnSpy = jasmine.createSpy('originalFunction');

    descriptor = {
      value: originalFnSpy,
      writable: true,
      configurable: true,
      enumerable: true,
    };

    hostObj = {
      cacheService: cacheServiceSpy,
    };
  });

  it('should warn and call original function if cacheService is missing', () => {
    hostObj.cacheService = undefined;
    spyOn(console, 'warn');

    Cacheable()({}, 'testMethod', descriptor);
    descriptor.value.apply(hostObj, ['arg1']);

    expect(console.warn).toHaveBeenCalledWith(
      `"testMethod" requires a "cacheService" property on the instance. Inject CacheService.`
    );
    expect(originalFnSpy).toHaveBeenCalledWith('arg1');
  });

  it('should return cached value if it exists and not call original function', () => {
    cacheServiceSpy.getCachedData.and.returnValue('cached_data');

    Cacheable()({}, 'testMethod', descriptor);
    const result = descriptor.value.apply(hostObj);

    expect(result).toBe('cached_data');
    expect(originalFnSpy).not.toHaveBeenCalled();
    expect(cacheServiceSpy.getCachedData).toHaveBeenCalledWith('testMethod');
  });

  it('should execute original function and cache result if no cached data exists (non-observable)', () => {
    cacheServiceSpy.getCachedData.and.returnValue(null);
    originalFnSpy.and.returnValue('new_data');

    Cacheable()({}, 'testMethod', descriptor);
    const result = descriptor.value.apply(hostObj);

    expect(result).toBe('new_data');
    expect(originalFnSpy).toHaveBeenCalled();
    expect(cacheServiceSpy.setCachedData).toHaveBeenCalledWith(
      'testMethod',
      'new_data'
    );
  });

  it('should use customKey if provided when checking and setting cache', () => {
    cacheServiceSpy.getCachedData.and.returnValue(null);
    originalFnSpy.and.returnValue('new_data');

    Cacheable('my_custom_key')({}, 'testMethod', descriptor);
    descriptor.value.apply(hostObj);

    expect(cacheServiceSpy.getCachedData).toHaveBeenCalledWith('my_custom_key');
    expect(cacheServiceSpy.setCachedData).toHaveBeenCalledWith(
      'my_custom_key',
      'new_data'
    );
  });

  it('should apply shareReplay and cache the observable if result is an Observable', done => {
    cacheServiceSpy.getCachedData.and.returnValue(null);
    const mockObservable = of('observable_data');
    originalFnSpy.and.returnValue(mockObservable);

    Cacheable()({}, 'testMethod', descriptor);
    const result = descriptor.value.apply(hostObj);

    expect(result).toBeInstanceOf(Observable);
    expect(cacheServiceSpy.setCachedData).toHaveBeenCalledWith(
      'testMethod',
      jasmine.any(Observable)
    );

    result.subscribe((val: string) => {
      expect(val).toBe('observable_data');
      done();
    });
  });
});
