import { EvaluationModel } from '../../../core/models/evaluation.model';

export const getStatusForEvaluationProcess = (evaluation: EvaluationModel) => {
  if (
    evaluation.pollName == null ||
    evaluation.pollName == '' ||
    evaluation.status == 'Incomplete'
  ) {
    return 'Incomplete';
  }

  const now = Date.now();
  const startTime = new Date(evaluation.startDate).getTime();
  const endTime = new Date(evaluation.endDate).getTime();

  if (now < startTime) {
    return 'Not started yet';
  } else if (now >= startTime && now < endTime) {
    return 'In progress';
  } else {
    return 'Finished';
  }
};
export const getEvalClass = (ev: EvaluationModel) =>
  getStatusForEvaluationProcess(ev).replaceAll(' ', '_');
