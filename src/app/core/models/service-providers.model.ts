import { AuditModel } from './common/audit.model';

export interface ServiceProviderModel {
  id: number;
  serviceProviderName: string;
  serviceProviderLogo: string;
  audit: AuditModel;
}
