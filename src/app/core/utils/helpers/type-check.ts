import { PollAvgQuestion, PollCountQuestion } from '@core/models/summary.model';

export function isPollCountQuestion(
  question: PollAvgQuestion | PollCountQuestion
): question is PollCountQuestion {
  return 'answers' in question;
}

export function isPollAvgQuestion(
  question: PollAvgQuestion | PollCountQuestion
): question is PollAvgQuestion {
  return 'answersDetails' in question;
}
