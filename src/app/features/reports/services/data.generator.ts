import {
  Answers,
  SurveyKind,
  Conf,
  Question,
  SurveyQuestions,
} from '../types/data.generator';

/**
 * Generates one possible result given configuration variable
 *
 * @param j? - index, allowing description to follow a order (A, B, C, etc.)
 * @returns Key-Value pair with a possible answer and related numeric value
 */
const generatePossibleAnswer = (conf: Conf, j: number) => {
  return {
    description: String.fromCharCode(j + 64),
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

  return { ...question.possibleAnswers[idxAnswer] };
};

/**
 * Returns a collection of sutomatically generated questions and possible answers and related values
 *
 * @remarks
 * Currently, this method doesn't create multiple choice answers
 *
 * @param surveyKind - String indicating the name of the risk's surveyKind
 * @param conf - Object indicating generation configuration
 * @returns Collection of randomly generated questions and answer values
 */
const generateMockupQuestions = (surveyKind: SurveyKind, conf: Conf) => {
  const questions: Question[] = [];

  for (let i = 0; i < conf.questions; i++) {
    const possibleAnswers = [];
    const cantPossibleAnswers =
      Math.floor(Math.random() * conf.max_answers) + conf.min_answers;

    for (let j = conf.min_answers; j <= cantPossibleAnswers + 1; j++) {
      const possibleAnswer = generatePossibleAnswer(conf, j);

      possibleAnswers.push(possibleAnswer);
    }
    questions.push({
      // 15% Chance to produce a multiple choice question
      isMultiple: false, //Math.random() < 0.15,
      possibleAnswers,
      description: `${surveyKind} - ${i}`,
    });
  }

  return { surveyKind, questions };
};

/**
 * Generates students' answers dinamically, based on configuration variable
 *
 * @param questions - Collection of survey's questions
 * @param conf - Object indicating generation configuration
 * @returns Collection of survey's answers
 */
const generateMockupAnswers = (
  questions: SurveyQuestions,
  conf: Conf
): Answers[] => {
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
    answers.push({
      surveyKind: questions.surveyKind,
      answers: [...studentAnswers],
    });
  }

  return answers;
};

export { generateMockupQuestions, generateMockupAnswers };
