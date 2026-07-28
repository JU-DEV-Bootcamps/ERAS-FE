import {
  AssessmentModel,
  AssessmentStatus,
} from '@core/models/assessment.model';
import { Lookup } from '@core/models/lookup';
import { Observable } from 'rxjs';

export interface AssessmentsLookups {
  profiles: Lookup[];
  services: Lookup[];
  professionals: Lookup[];
  students: Lookup[];
  preselectedStudentId?: number;
  createProfessional?: (name: string) => Observable<Lookup>;
}

export interface AssessmentModalData extends AssessmentsLookups {
  assessment: AssessmentModel;
}

export interface EditAssessmentModel {
  date: string;
  professional: string;
  professionalComment?: string;
  service: string;
  students: string[];
  submitter: string;
  status: AssessmentStatus;
}
