type SurveyAnswers = Answers[];

interface Coordinate {
  x: string;
  y: number;
}

type AdaptAnswers = (
  questions: Questions,
  rawAnswers: SurveyAnswers
) => ApexAxisChartSeries;

interface PollData {
  componentName: string;
  series: ApexAxisChartSeries;
  variables: {
    variables: Question[];
  };
}

export type { AdaptAnswers, Coordinate, PollData, SurveyAnswers };
