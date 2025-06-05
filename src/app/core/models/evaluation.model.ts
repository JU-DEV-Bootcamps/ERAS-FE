import { BaseModel } from './common/base.model';
import { PollInstanceModel } from './poll-instance.model';
import { PollModel } from './poll.model';

export interface EvaluationModel extends BaseModel {
  name: string;
  status: string;
  startDate: Date;
  endDate: Date;
  pollName: string;
  country: string;
  pollId: number;
  evaluationPollId: number;
  polls: PollModel[];
  pollInstances: PollInstanceModel[];
}
