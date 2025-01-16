type SurveyAnswers = Answers[];
interface Coordinate {
  x: string;
  y: number;
}
type AdaptAnswers = (
  questions: Questions,
  rawAnswers: SurveyAnswers
) => ApexAxisChartSeries;

export type { SurveyAnswers, Coordinate, AdaptAnswers };
