import { Component } from '@angular/core';
import { ActionButton } from '@core/factories/action-handler/models/action-button.model';
import { ActionType } from '@core/factories/action-handler/models/action-type.enum';
import { ActionContextDirective } from '@shared/directives/actionContextDirective';
import { GroupActionButtonComponent } from '@shared/components/buttons/group-action-buttons/group-action-button.component';

@Component({
  selector: 'app-dynamic-charts-v2',
  templateUrl: './dynamic-charts-v2.component.html',
  styleUrl: './dynamic-charts-v2.component.scss',
  imports: [GroupActionButtonComponent, ActionContextDirective],
})
export class DynamicChartsV2Component {
  actions: ActionButton[] = [
    { type: ActionType.FULLSCREEN, icon: 'fullscreen', tooltip: 'Fullscreen' },
  ];
}
