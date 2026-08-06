import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class CacheService {
  private _cachedData = new Map<string, { data: unknown; timestamp: number }>();
  private _timeToLive = 5 * 60 * 1000; // 5 minutes

  /**
   * Looks for a cached data using the `key` parameter. If exists and it is
   * within the `timeToLive` returns the cached value. If not, returns `null`.
   * @param key the key of the data to be retrieved.
   * @returns cached data (T) or null.
   */
  getCachedData<T>(key: string): T | null {
    const cachedData = this._cachedData.get(key);
    if (cachedData && Date.now() - cachedData.timestamp < this._timeToLive) {
      return cachedData.data as T;
    }

    return null;
  }

  /**
   * Sets or updates cached data.
   * @param key the key that identifies the cached value.
   * @param data the data to be cached.
   */
  setCachedData<T>(key: string, data: T): void {
    this._cachedData.set(key, { data, timestamp: Date.now() });
  }

  /**
   * Removes the cached value assigned to the `key` parameter.
   * @param key the key of the cached value to invalidate.
   */
  invalidateCachedData(key: string) {
    this._cachedData.delete(key);
  }

  /**
   * Removes all cached data.
   */
  clearAllCachedData() {
    this._cachedData.clear();
  }
}
