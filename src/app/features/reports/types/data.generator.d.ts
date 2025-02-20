interface Conf {
  multiple_answers_action: 'ADD' | 'AVG';
  min_answers: number;
  max_answers: number;
  min_value: number;
  max_value: number;
  questions: number;
  cantStudents: number;
}
type ComponentName = 'ACADEMIC' | 'INDIVIDUAL' | 'FAMILIAR' | 'SOCIAL';
interface PossibleAnswer {
  description: string;
  value: number;
}
type Answer = PossibleAnswer;
interface Answers {
  componentName: ComponentName;
  answers: Answer[];
}
interface Variable {
  possibleAnswers: PossibleAnswer[];
  description: string;
}
interface Variables {
  componentName: SurveyKind;
  variables: Variable[];
}
type MockUpAnswers = Record<
  ComponentName,
  { variables: Variables; series: ApexAxisChartSeries } | null
>;

export type {
  Conf,
  PossibleAnswer,
  Answer,
  Answers,
  Variable,
  Variables,
  ComponentName,
  MockUpAnswers,
};
