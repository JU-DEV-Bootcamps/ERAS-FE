import { AuditModel } from '@core/models/common/audit.model';
import { CohortModel } from '@core/models/cohort.model';
import { StudentDetailModel } from '@core/models/student-detail.model';

export interface Referral {
  comment: string;
  date: string;
  id: number;
  professional: string;
  service: string;
  status: string;
  student: string;
  submitter?: string;
}

export interface RESTReferral {
  assignedProfessional: AssignedProfessional;
  audit: AuditModel;
  comment: string;
  date: string;
  id: number;
  juService: JuService;
  status: number;
  studentIds: number[];
  submitterUuid: string;
}

export interface JuService {
  audit: AuditModel;
  name: string;
}

export interface Student {
  audit: AuditModel;
  cohort: CohortModel;
  email: string;
  id: number;
  isImported: boolean;
  name: string;
  studentDetail: StudentDetailModel;
  uuid: string;
}

export interface AssignedProfessional {
  audit: AuditModel;
  id: number;
  name: string;
  uuid: string;
}
