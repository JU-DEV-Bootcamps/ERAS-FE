import { AuditModel } from './common/audit.model';
import { BaseModel } from './common/base.model';

export interface ConfigurationsModel extends BaseModel {
  userId: string;
  configurationName: string;
  baseURL: string;
  encryptedKey: string;
  serviceProviderId: number;
  isDeleted: boolean;
  audit: AuditModel;
}
