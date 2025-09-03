import { CohortModel } from '@core/models/cohort.model';
import { AuditModel } from '@core/models/common/audit.model';
import { StudentDetailModel } from '@core/models/student-detail.model';

export interface Referral {
  id: number;
  date: string;
  submitter: string;
  service: string;
  professional: string;
  student: string;
  comment: string;
  status: string;
}

export interface RESTReferral {
  id: number;
  submitterUuid: string;
  juService: JuService;
  comment: string;
  date: Date;
  status: number;
  students: Student[];
  audit: AuditModel;
}

export interface JuService {
  name: string;
  audit: AuditModel;
}

export interface Student {
  id: number;
  uuid: string;
  name: string;
  email: string;
  isImported: boolean;
  studentDetail: StudentDetailModel;
  cohort: CohortModel;
  audit: AuditModel;
}
