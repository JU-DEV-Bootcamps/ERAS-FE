export interface CreateEvaluationProcess {
  Name: string;
  StartDate: Date;
  EndDate: Date;
  PollId: string;
}

export interface ReadEvaluationProcess {
  Id: string;
  Name: string;
  StartDate: Date;
  EndDate: Date;
  PollId: string;
  EvaluationPollId: number;
  PollName: string | null;
}
