import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { switchMap, map, Observable } from 'rxjs';

import { EvaluationModel } from '@core/models/evaluation.model';
import { PagedReadEvaluationProcess } from '@core/models/evaluation-request.model';

import { EvaluationsService } from '@core/services/api/evaluations.service';

export const evaluationProcessesResolver: ResolveFn<
  EvaluationModel[]
> = (): Observable<EvaluationModel[]> => {
  const evaluationsService = inject(EvaluationsService);

  return evaluationsService.getAllEvalProc({ page: 1, pageSize: 1 }).pipe(
    switchMap((firstPage: PagedReadEvaluationProcess) =>
      evaluationsService.getAllEvalProc({
        page: 1,
        pageSize: firstPage.count,
      })
    ),
    map(response => response.items)
  );
};
