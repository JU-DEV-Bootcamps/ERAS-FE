import { ConfigurationsModel } from '@core/models/configurations.model';

export interface PreselectedPoll {
  evaluationId: number;
  configuration: ConfigurationsModel;
  pollName: string;
  startDate: string;
  endDate: string;
}
