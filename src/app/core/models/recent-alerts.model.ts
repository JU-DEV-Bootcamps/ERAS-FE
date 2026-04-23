import { BaseModel } from './common/base.model';

export interface RecentAlertsModel extends BaseModel {
  studentId: string;
  riskLevel: string;
  category: string;
  date: Date;
  status: string;
}
