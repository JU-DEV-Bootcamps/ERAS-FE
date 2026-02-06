import { Component, computed, input, signal } from '@angular/core';

import { ActionButton } from '@core/factories/action-handler/models/action-button.model';
import { EvaluationModel } from '@core/models/evaluation.model';
import { ActionType } from '@core/factories/action-handler/models/action-type.enum';

import { ActionContextDirective } from '@shared/directives/actionContextDirective';

import { GroupActionButtonComponent } from '@shared/components/buttons/group-action-buttons/group-action-button.component';
import {
  ErasSelectComponent,
  SelectedOptionModel,
} from '@shared/components/eras-select/eras-select.component';

@Component({
  selector: 'app-dynamic-charts-v2',
  templateUrl: './dynamic-charts-v2.component.html',
  styleUrl: './dynamic-charts-v2.component.scss',
  imports: [
    ActionContextDirective,
    ErasSelectComponent,
    GroupActionButtonComponent,
  ],
})
export class DynamicChartsV2Component {
  readonly evaluations = input<EvaluationModel[]>([]);
  actions: ActionButton[] = [
    { type: ActionType.FULLSCREEN, icon: 'fullscreen', tooltip: 'Fullscreen' },
  ];

  readonly evaluationOptions = computed<SelectedOptionModel<number>[]>(() => {
    const evals = this.evaluations();

    return evals
      ? evals.map(evaluation => {
          return { label: evaluation.name, value: evaluation.id };
        })
      : [];
  });

  readonly selectedEvaluation = signal<number | null>(null);
}
