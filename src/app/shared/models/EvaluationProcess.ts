export interface CreateEvaluationProcess {
  name: string;
  startDate: Date;
  endDate: Date;
  pollName?: string;
  country?: string;
}
export interface ReadEvaluationProcess {
  id: number;
  name: string;
  startDate: Date;
  endDate: Date;
  pollId?: number;
  evaluationPollId?: number;
  pollName?: string | null;
  country?: string | null;
  status?: string;
}
export interface PagedReadEvaluationProcess {
  count: number;
  items: ReadEvaluationProcess[];
}
