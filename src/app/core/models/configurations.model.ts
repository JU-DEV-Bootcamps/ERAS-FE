import { AuditModel } from './common/audit.model';

export interface ConfigurationsModel {
  id: number;
  userId: string;
  configurationName: string;
  baseURL: string;
  encryptedKey: string;
  serviceProviderId: number;
  isDeleted: boolean;
  audit: AuditModel;
}
