/* eslint-disable @typescript-eslint/prefer-for-of */

import { Coordinate, SurveyAnswers } from '../types/data.adapter';
import { Questions } from '../types/data.generator';

/**
 * Returns answers, adapted for Apexcharts
 *
 * @param questions - Collection of survey's questions
 * @param rawSurveyAnswers - Survey answers without being processed
 * @returns Collection of answers, adapted to be used on Apexcharts' chartOptions.series
 */
const adaptAnswers = (
  questions: Questions,
  rawSurveyAnswers: SurveyAnswers
) => {
  const adaptedAnswers: ApexAxisChartSeries = [];

  for (let i = 0; i < questions.questions.length; i++) {
    const question = questions.questions[i];

    const adaptedAnswer: { name: string; data: Coordinate[] } = {
      name: question.description!,
      data: [],
    };

    // Init answers
    for (let j = 0; j < question.possibleAnswers.length; j++) {
      const possibleAnswer = question.possibleAnswers[j];

      adaptedAnswer.data.push({
        x: possibleAnswer.description,
        y: 0,
      });
    }
    adaptedAnswers.push(adaptedAnswer);
  }
  // Count users with same answers
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
  }

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
    console.log(
      selectedQuestions.length === 0 ||
        (s.name && selectedQuestions.includes(s.name))
    );
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

export { adaptAnswers, filterAnswers, orderAnswers };
