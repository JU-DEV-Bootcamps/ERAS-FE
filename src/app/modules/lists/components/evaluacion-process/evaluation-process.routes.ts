import { Routes } from '@angular/router';
import { EvaluationProcessListComponent } from './evaluation-process-list.component';
import { ImportPreviewComponent } from '@modules/imports/components/import-preview/import-preview.component';
import { ROUTE_METADATA } from '@core/utils/routing/route-metadata';

export const EVALUATION_PROCESSES: Routes = [
  {
    path: '',
    component: EvaluationProcessListComponent,
    data: ROUTE_METADATA.EVALUATION_PROCESS,
    children: [
      {
        path: 'import-preview',
        component: ImportPreviewComponent,
        data: ROUTE_METADATA.IMPORT_PREVIEW,
      },
    ],
  },
];
