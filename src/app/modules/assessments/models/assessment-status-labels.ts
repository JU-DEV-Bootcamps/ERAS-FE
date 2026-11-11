import { AssessmentStatus } from '@core/models/assessment.model';

export const ASSESSMENT_STATUS_LABELS: Record<AssessmentStatus, string> = {
  [AssessmentStatus.Remitted]: 'Remitted',
  [AssessmentStatus.InProgress]: 'In Progress',
  [AssessmentStatus.Finalized]: 'Finalized',
};
