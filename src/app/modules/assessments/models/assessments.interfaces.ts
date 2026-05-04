import { AssessmentModel } from '@core/models/assessement.model';
import { Lookup } from '@core/models/lookup';

export interface AssessmentsLookups {
  profiles: Lookup[];
  services: Lookup[];
  professionals: Lookup[];
  students: Lookup[];
}

export interface AssessmentModalData extends AssessmentsLookups {
  assessment: AssessmentModel;
}
