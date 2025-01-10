import {
  Answers,
  Component,
  Conf,
  Question,
  Questions,
} from '../types/data.generator';

const conf: Conf = {
  multiple_answers_action: 'AVG',
  min_answers: 1,
  max_answers: 10,
  min_value: 1,
  max_value: 5,
  questions: 10,
  cantStudents: 10,
};

/**
 * Generates one possible result given configuration variable
 *
 * @param j? - index, allowing description to follow a order (A, B, C, etc.)
 * @returns Key-Value pair with a possible answer and related numeric value
 */
const generateResult = (j: number) => {
  return {
    description: String.fromCharCode(
      /*Math.floor( Math.random() * 26) */ j + 65
    ),
    value: Math.floor(Math.random() * conf.max_value) + conf.min_value,
  };
};

/**
 * Returns one answer, given a specific question with possible answer collections initiated
 *
 * @param question - Question with possible answer collection
 * @returns One of the possible answers
 */
const generateAnswer = (question: Question) => {
  const idxAnswer = Math.floor(Math.random() * question.possibleAnswers.length);

  return question.possibleAnswers[idxAnswer];
};

/**
 * Returns a collection of sutomatically generated questions and possible answers and related values
 *
 * @remarks
 * Currently, this method doesn't create multiple choice answers
 *
 * @param component - String indicating the name of the risk component
 * @returns Collection of randomly generated questions and answer values
 */
const generateMockupQuestions = (component: Component) => {
  const questions: Question[] = [];

  for (let i = 0; i < conf.questions; i++) {
    const possibleAnswers = [];
    const cantPossibleAnswers =
      Math.floor(Math.random() * conf.max_answers) + conf.min_answers;

    for (let j = conf.min_answers - 1; j < cantPossibleAnswers; j++) {
      possibleAnswers.push(generateResult(j));
    }
    questions.push({
      // 15% Chance to produce a multiple choice question
      isMultiple: false, //Math.random() < 0.15,
      possibleAnswers,
      description: `Question - ${i}`,
    });
  }

  return { component, questions };
};

/**
 * Generates students' answers dinamically, based on configuration variable
 *
 * @param questions - Collection of survey's questions
 * @returns Collection of survey's answers
 */
const generateMockupAnswers = (questions: Questions): Answers[] => {
  const answers: Answers[] = [];

  for (let i = 0; i < conf.cantStudents; i++) {
    const studentAnswers = [];

    for (let j = 0; j < conf.questions; j++) {
      const question = questions.questions[j];

      let answerResult;

      if (!question.isMultiple) {
        answerResult = generateAnswer(question);
      } else {
        const cantSelectedAnswers =
          Math.floor(Math.random() * conf.max_answers) + conf.min_answers;
        const selectedAnswers = [];

        for (let k = 0; k < cantSelectedAnswers; k++) {
          selectedAnswers.push(generateAnswer(question));
        }
        answerResult = {
          description: selectedAnswers[0].description,
          value: Math.floor(
            selectedAnswers.reduce((acc, val) => acc + val.value, 0) /
              (conf.multiple_answers_action === 'AVG'
                ? selectedAnswers.length
                : 1)
          ),
        };
      }
      studentAnswers.push(answerResult);
    }
    answers.push({ component: questions.component, answers: studentAnswers });
  }

  return answers;
};

export { generateMockupQuestions, generateMockupAnswers };
