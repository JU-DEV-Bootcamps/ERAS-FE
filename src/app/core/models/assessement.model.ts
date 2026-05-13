export interface AssessmentModel {
  id?: number;

  createdAtUtc: string;
  createdBy: string;
  service: string;

  assignedProfessional?: string | null;
  studentIds: string[];

  diagnosis?: string | null;
  objective?: string | null;
  comments?: string | null;

  plan?: InterventionPlanModel | null;

  status: AssessmentStatus;

  interventions: InterventionModel[];
}

export interface InterventionPlanModel {
  sessionsPerWeek?: number | null;
  scheduleNotes?: string | null;
}

export interface InterventionModel {
  id?: string;

  dateUtc: string;

  activityType?: string | null;
  professional?: string | null;
  comments?: string | null;

  attachments: string[];
}

export enum AssessmentStatus {
  Created = 'Created',
  InProgress = 'InProgress',
  OnHold = 'OnHold',
  Remitted = 'Remitted',
  Resolved = 'Resolved',
}
