import { AnswerModel } from './answer.model';
import { BaseModel } from './common/base.model';
import { PollModel } from './poll.model';
import { VariableModel } from './variable.model';

export interface PollVariableModel extends BaseModel {
  pollId: number;
  variableId: number;
  poll?: PollModel;
  variable?: VariableModel;
  answers?: AnswerModel[];
}
