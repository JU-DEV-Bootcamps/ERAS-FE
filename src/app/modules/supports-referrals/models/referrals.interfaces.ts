import { AuditModel } from '@core/models/common/audit.model';
import { Profile } from '@core/models/profile.model';
import { KeycloakProfile } from 'keycloak-js';

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

export interface PostReferral {
  assignedProfessionalId: string;
  audit: AuditModel;
  comment: string;
  date: string;
  id: number;
  juServiceId: string;
  status: number;
  studentIds: string;
  submitterUuid?: string;
  success?: boolean;
}

export interface JuService {
  audit: AuditModel;
  name: string;
}

export interface AssignedProfessional {
  audit: AuditModel;
  id: number;
  name: string;
  uuid: string;
}

export interface ResolverReferralData {
  referrals: ResolverReferral;
  lookups: {
    profiles: Profile[];
    services: JuService[];
    professionals: AssignedProfessional[];
    students: ReferralStudent[];
  };
}

export interface ReferralStudent {
  email?: string;
  id?: number;
  isImported?: boolean;
  name?: string;
}

export interface ResolverReferral {
  count: number;
  items: Referral[];
  profile: KeycloakProfile;
}

export interface ReferralResponse {
  entity: RESTReferral;
  message: string;
  success: boolean;
}
