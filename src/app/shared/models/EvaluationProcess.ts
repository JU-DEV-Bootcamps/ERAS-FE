export interface CreateEvaluationProcess {
  Name: string;
  StartDate: Date;
  EndDate: Date;
  PollName?: string;
}
export interface ReadEvaluationProcess {
  Id: number;
  Name: string;
  StartDate: Date;
  EndDate: Date;
  PollId: number;
  EvaluationPollId: number;
  PollName: string | null;
}
