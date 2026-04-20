export interface DashboardKpiResponse {
  body: DashboardKpi;
  message: string;
  status: string;
  success: boolean;
  validationErrors: [];
}

export interface DashboardKpi {
  totalStudents: SummaryKpi;
  totalPollsAnswered: SummaryKpi;
  totalEvaluations: SummaryKpi;
}

export interface SummaryKpi {
  value: number;
  percentageChange: number;
}
