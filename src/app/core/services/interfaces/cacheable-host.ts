import { CacheService } from '../cache.service';

/**
 * Interface to ensure a class has a reference
 * to CacheService.
 *
 * Intended to be implemented on classes that use
 * `@Cacheable` decorator on any of their methods
 */
export interface CacheableHost {
  cacheService: CacheService;
}
