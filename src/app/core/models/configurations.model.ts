import { AuditModel } from './common/audit.model';

export interface ConfigurationsModel {
  id: number;
  userId: string;
  configurationName: string;
  baseUrl: string;
  encryptedKey: string;
  serviceProviderId: number;
  audit: AuditModel;
}
