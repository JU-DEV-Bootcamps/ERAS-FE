import { PollAvgQuestion, PollCountQuestion } from '@core/models/summary.model';

export interface CSVParserError {
  parserError: boolean;
  code: string;
  message: string;
  row: number;
  type: string;
}

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

export function isCSVParserError(errors: object[]) {
  return errors.every(error => 'parserError' in error);
}
