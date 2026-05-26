import { StudentProfileData } from '@modules/assessments/components/assessment-list/assessment-student-data/assessment-student-data.component';

export interface AssessmentModel {
  id?: number;

  createdAtUtc: string;
  createdBy: string;
  service: string;

  assignedProfessional?: string | null;
  studentIds: string[];
  studentNames?: string[];
  students?: StudentProfileData[];

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
  id?: number;
  assessmentId: number;

  kind: InterventionType;
  mode: InterventionMode;
  status?: InterventionStatus;

  professional?: string | null;
  dateUtc: string;
  activity?: string | null;
  comments?: string | null;

  area?: string | null;
  numberOfParticipants?: number | null;
  studentIds: string[];
  attendance?: Record<number, boolean> | null;

  remarks?: string | null;
  attachments?: string[] | null;
}

export interface InterventionAttendanceModel {
  studentId: string;
  attended: boolean;
}

export interface InterventionRowViewModel extends InterventionModel {
  studentDisplay: string;
  commentPreview: string;
}

export enum InterventionMode {
  InPlace = 'InPlace',
  Remote = 'Remote',
}

export enum InterventionType {
  Individual = 'Individual',
  Group = 'Group',
}

export enum AssessmentStatus {
  Created = 'Created',
  InProgress = 'InProgress',
  OnHold = 'OnHold',
  Remitted = 'Remitted',
  Resolved = 'Resolved',
  Rejected = 'Rejected',
}

export enum InterventionStatus {
  Created = 'Created',
  InProgress = 'InProgress',
  OnHold = 'OnHold',
  Remitted = 'Remitted',
  Resolved = 'Resolved',
  Rejected = 'Rejected',
}
