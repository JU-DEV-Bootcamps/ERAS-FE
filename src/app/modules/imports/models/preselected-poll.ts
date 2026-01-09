import { ConfigurationsModel } from '@core/models/configurations.model';

export interface PreselectedPoll {
  configuration: ConfigurationsModel;
  pollName: string;
  startDate: string;
  endDate: string;
}
