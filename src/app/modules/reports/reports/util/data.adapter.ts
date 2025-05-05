import { Coordinate, PollData, SurveyAnswers } from '../types/data.adapter';
import {
  MockUpAnswers,
  SurveyKind,
  SurveyQuestions,
} from '../types/data.generator';

/**
 * Returns mockup answers, adapted for Apexcharts
 *
 * @param questions - Collection of survey's questions
 * @param rawSurveyAnswers - Survey answers without being processed
 * @returns Collection of answers, adapted to be used on Apexcharts' chartOptions.series
 */
const adaptMockAnswers = (
  questions: SurveyQuestions,
  rawSurveyAnswers: SurveyAnswers
) => {
  const adaptedAnswers: ApexAxisChartSeries = [];

  for (const question of questions.questions) {
    const adaptedAnswer: { name: string; data: Coordinate[] } = {
      name: question.description!,
      data: [],
    };

    // Init answers
    for (const possibleAnswer of question.possibleAnswers) {
      adaptedAnswer.data.push({
        x: possibleAnswer.description,
        y: 0,
      });
    }
    adaptedAnswers.push(adaptedAnswer);
  }
  // Count users with same answers
  for (const rawSurveyAnswer of rawSurveyAnswers) {
    for (let k = 0; k < rawSurveyAnswer.answers.length; k++) {
      const answer = rawSurveyAnswer.answers[k];
      const adaptedAnswer = adaptedAnswers[k];

      const idx = adaptedAnswer.data.findIndex(adapted => {
        return (adapted as Coordinate).x === answer.description;
      });

      if (idx > -1) {
        (adaptedAnswer.data[idx] as Coordinate).y++;
      }
    }
  }

  return adaptedAnswers;
};

/**
 * Returns real v1 answers, adapted for Apexcharts
 *
 * @param questions - Collection of survey's questions
 * @param rawSurveyAnswers - Survey answers without being processed
 * @returns Collection of answers, adapted to be used on Apexcharts' chartOptions.series
 */
const adaptAnswers = (pollData: PollData[]) => {
  const spanishToEnglish = {
    academico: 'ACADEMIC',
    individual: 'INDIVIDUAL',
    familiar: 'FAMILIAR',
    socioeconomico: 'SOCIAL',
  };
  const adaptedAnswers: MockUpAnswers = {
    ACADEMIC: null,
    INDIVIDUAL: null,
    FAMILIAR: null,
    SOCIAL: null,
  };

  for (const component of pollData) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //@ts-ignore
    const key: SurveyKind = spanishToEnglish[component.componentName];

    adaptedAnswers[key] = {
      questions: {
        surveyKind: key,
        questions: component.variables.variables,
      },
      series: component.series,
    };
  }

  /* // Count users with same answers
  for (let j = 0; j < rawSurveyAnswers.length; j++) {
    const rawSurveyAnswer = rawSurveyAnswers[j];

    for (let k = 0; k < rawSurveyAnswer.answers.length; k++) {
      const answer = rawSurveyAnswer.answers[k];
      const adaptedAnswer = adaptedAnswers[k];

      const idx = adaptedAnswer.data.findIndex(adapted => {
        return (adapted as Coordinate).x === answer.description;
      });

      if (idx > -1) {
        (adaptedAnswer.data[idx] as Coordinate).y++;
      }
    }
  } */

  return adaptedAnswers;
};

/**
 * Returns a collection of filtered anwers
 *
 * @param series - Collection of answers data to be filtered
 * @param selected - string array with the description of selected answers
 *
 * @returns Collection of ordered answers
 */
const filterAnswers = (
  series: ApexAxisChartSeries,
  selectedQuestions: string[]
) => {
  return series.filter(s => {
    return (
      selectedQuestions.length === 0 ||
      (s.name && selectedQuestions.includes(s.name))
    );
  });
};

/**
 * Returns a collection of ordered anwers with potentially the same amount of columns per question
 *
 * @param answers - Collection of unordered questions
 * @param fill? - boolean indicating if user wants the same amount of columns on each question
 *
 * @returns Collection of ordered answers
 */
const orderAnswers = (answers: ApexAxisChartSeries, fill?: boolean) => {
  let idxLabels = 0;

  // Search for row with the highest amount of answers
  for (let i = 0; i < answers.length; i++) {
    if (answers[i].data.length > answers[idxLabels].data.length) {
      idxLabels = i;
    }
  }

  if (fill) {
    // Fill other rows with blanks
    // Reorder answers on each row based on values
    answers.forEach(answer => {
      for (
        let i = 0;
        answers[idxLabels].data.length > answer.data.length;
        i++
      ) {
        const coord = { x: 'No answer', y: -1 };

        (answer.data as unknown[]).push(coord);
      }
      answer.data = answer.data.sort((a: unknown, b: unknown) => {
        return (a as Coordinate).y - (b as Coordinate).y;
      });
    });
  }

  return answers;
};

export { adaptAnswers, adaptMockAnswers, filterAnswers, orderAnswers };
