interface Conf {
  multiple_answers_action: 'ADD' | 'AVG';
  min_answers: number;
  max_answers: number;
  min_value: number;
  max_value: number;
  questions: number;
  cantStudents: number;
}
type Component = 'ACADEMIC' | 'INDIVIDUAL' | 'FAMILIAR' | 'SOCIAL';
interface PossibleAnswer {
  description: string;
  value: number;
}
type Answer = PossibleAnswer;
interface Answers {
  component: Component;
  answers: Answer[];
}
interface Question {
  isMultiple: boolean;
  possibleAnswers: PossibleAnswer[];
  description?: string;
}
interface Questions {
  component: Component;
  questions: Question[];
}

export type {
  Conf,
  Component,
  PossibleAnswer,
  Answer,
  Answers,
  Question,
  Questions,
};
