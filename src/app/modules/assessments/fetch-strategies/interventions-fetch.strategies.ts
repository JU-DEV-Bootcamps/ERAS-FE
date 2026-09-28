import { InterventionModel } from '@core/models/assessment.model';
import { ERASRoles } from '@core/models/profile.model';
import { InterventionService } from '@core/services/api/intervention.service';
import { RoleFetchStrategyMap } from '@core/utils/strategies/role-based-fetch-strategy/role-based-fetch.types';
import { throwError } from 'rxjs';

export const InterventionsFetchStrategies: RoleFetchStrategyMap<
  InterventionService,
  InterventionModel[]
> = {
  [ERASRoles.ADMIN]: (service, context) =>
    context?.assessmentId
      ? service.getByAssessment(context.assessmentId)
      : throwError(() => new Error('Assessment ID not provided.')),
  [ERASRoles.PROFESSIONAL]: (service, context) => {
    if (!context?.currentUserId)
      return throwError(() => new Error('User ID not provided.'));
    if (!context?.assessmentId)
      return throwError(() => new Error('Assessment ID not provided.'));

    return service.getByAssessmentAndAssignedProfessional(
      context.assessmentId,
      context.currentUserId
    );
  },
  [ERASRoles.OFFICER]: (service, context) => {
    if (!context?.currentUserId)
      return throwError(() => new Error('User ID not provided.'));
    if (!context?.assessmentId)
      return throwError(() => new Error('Assessment ID not provided.'));

    return service.getByAssessmentAndCreator(
      context.assessmentId,
      context.currentUserId
    );
  },
  [ERASRoles.GUEST]: () => throwError(() => new Error('User not authorized.')),
};
