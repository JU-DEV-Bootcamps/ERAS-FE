import { Observable, shareReplay } from 'rxjs';
import { CacheableHost } from '@core/services/interfaces/cacheable-host';

/**
 * Custom decorator to make a function cacheable. It stores the
 * return value of the function as an entry of a `Map` in `CacheService`.
 * Receives a string for setting a custom key for the cached value.
 * If not provided, defaults to the function name.
 *
 * It requires the class in which is used to implement `CacheableHost` interface
 * and have a reference to `CacheService`.
 *
 * @param customKey custom key to identify cached data.
 */
function Cacheable(customKey?: string) {
  return function (
    target: object,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalFunction = descriptor.value;
    const cacheKey = customKey ?? propertyKey;

    descriptor.value = function (this: CacheableHost, ...args: unknown[]) {
      const cacheService = this.cacheService;

      if (!cacheService) {
        console.warn(
          `"${propertyKey}" requires a "cacheService" property on the instance. Inject CacheService.`
        );

        return originalFunction.apply(this, args);
      }
      const cachedValue = cacheService.getCachedData(cacheKey);

      if (cachedValue !== null) {
        return cachedValue;
      }

      const result = originalFunction.apply(this, args);

      // Use shareReplay to avoid triggering request on new subscriptions.
      if (result instanceof Observable) {
        const sharedObservable = result.pipe(
          shareReplay({ bufferSize: 1, refCount: false })
        );
        cacheService.setCachedData(cacheKey, sharedObservable);

        return sharedObservable;
      }

      // Non-observable cases.
      cacheService.setCachedData(cacheKey, result);
      return result;
    };
  };
}

export { Cacheable };
