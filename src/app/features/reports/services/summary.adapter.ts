import { Questions } from '../types/data.generator';
import { Coordinate, SurveyAnswers } from '../types/data.adapter';

export const adaptComponent = (
  questions: Questions,
  rawSurveyAnswers: SurveyAnswers
) => {
  //console.log(questions);
  //console.log(rawSurveyAnswers);
  const variables = questions.questions.map(question => question.description);

  const variableObjects = variables.map(varName => ({
    varName,
    totalSum: 0,
    count: 0,
  }));

  for (const rawSurveyAnswer of rawSurveyAnswers) {
    for (let i = 0; i < rawSurveyAnswer.answers.length; i++) {
      const answers = rawSurveyAnswer.answers;
      //console.log(answers);
      variableObjects[i].totalSum += answers[i].value;
      variableObjects[i].count += 1;
    }
  }

  const newVariableObjects = variableObjects.map(variableObject => ({
    varName: variableObject.varName,
    scoreAverage: variableObject.totalSum / variableObject.count,
  }));

  const componentSummary = {
    componentName: questions.surveyKind,
    variables: newVariableObjects,
  };
  console.log(componentSummary);
  return componentSummary;
};

export const adaptToHeatMap = (componentsSummary: any) => {
  const adaptedComponents: ApexAxisChartSeries = [];
  for (const componentSummary of componentsSummary) {
    const adaptedComponent: { name: string; data: Coordinate[] } = {
      name: componentSummary.componentName,
      data: [],
    };
    for (const variable of componentSummary.variables) {
      adaptedComponent.data.push({
        x: variable.varName,
        y: variable.scoreAverage,
      });
    }
    adaptedComponents.push(adaptedComponent);
  }
  return adaptedComponents;
};
