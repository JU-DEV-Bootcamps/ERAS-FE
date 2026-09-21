import { ERASRoles } from '@core/models/profile.model';
import { Observable } from 'rxjs';

interface FetchContext {
  currentUserId?: string;
  assessmentId?: number;
}

type RoleFetchStrategy<TService, TResult> = (
  service: TService,
  context?: FetchContext
) => Observable<TResult>;

type RoleFetchStrategyMap<TService, TResult> = Record<
  ERASRoles,
  RoleFetchStrategy<TService, TResult>
>;

export { FetchContext, RoleFetchStrategy, RoleFetchStrategyMap };
