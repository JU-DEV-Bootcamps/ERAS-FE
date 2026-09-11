import { AssessmentModel } from '@core/models/assessment.model';
import { ERASRoles } from '@core/models/profile.model';
import { AssessmentService } from '@core/services/api/assessement.service';
import { RoleFetchStrategyMap } from '@core/utils/strategies/role-based-fetch-strategy/role-based-fetch.types';
import { throwError } from 'rxjs';

export const AssessmentFetchStrategies: RoleFetchStrategyMap<
  AssessmentService,
  AssessmentModel[]
> = {
  [ERASRoles.ADMIN]: service => service.getAll(),
  [ERASRoles.PROFESSIONAL]: (service, context) =>
    context?.currentUserId
      ? service.getByProfessional(context.currentUserId)
      : throwError(() => new Error('User ID not provided.')),
  [ERASRoles.OFFICER]: (service, context) =>
    context?.currentUserId
      ? service.getByCreator(context.currentUserId)
      : throwError(() => new Error('User ID not provided.')),
  [ERASRoles.GUEST]: () => throwError(() => new Error('User not authorized.')),
};
