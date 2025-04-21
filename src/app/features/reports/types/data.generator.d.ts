interface Conf {
  multiple_answers_action: 'ADD' | 'AVG';
  min_answers: number;
  max_answers: number;
  min_value: number;
  max_value: number;
  questions: number;
  cantStudents: number;
}
type SurveyKind = 'ACADEMIC' | 'INDIVIDUAL' | 'FAMILIAR' | 'SOCIAL';
interface PossibleAnswer {
  description: string;
  value: number;
}
type Answer = PossibleAnswer;
interface Answers {
  surveyKind: SurveyKind;
  answers: Answer[];
}
interface Question {
  isMultiple: boolean;
  possibleAnswers: PossibleAnswer[];
  description: string;
  variableId: number;
}
interface SurveyQuestions {
  surveyKind: SurveyKind;
  questions: Question[];
}
interface QuestionsSeries {
  questions: SurveyQuestions;
  series: ApexAxisChartSeries;
}
type MockUpAnswers = Record<SurveyKind, QuestionsSeries | null>;

export type {
  Conf,
  PossibleAnswer,
  Answer,
  Answers,
  Question,
  QuestionsSeries,
  SurveyQuestions,
  SurveyKind,
  MockUpAnswers,
};
