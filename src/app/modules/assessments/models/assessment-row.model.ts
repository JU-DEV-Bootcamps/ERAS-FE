import { AssessmentModel } from '@core/models/assessment.model';

export interface AssessmentRowViewModel extends AssessmentModel {
  studentDisplay: string;
  commentPreview: string;
  isEditable: boolean;
  submitterDisplay: string;
  professionalDisplay: string;
}
