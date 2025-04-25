import { AuditModel } from './audit.model';

export interface BaseModel {
  id: number;
  audit?: AuditModel;
}
