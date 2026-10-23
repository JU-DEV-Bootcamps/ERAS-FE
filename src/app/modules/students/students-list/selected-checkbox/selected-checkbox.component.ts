import { Component, Input, output } from '@angular/core';
import {
  MatCheckboxChange,
  MatCheckboxModule,
} from '@angular/material/checkbox';
import { MatTooltipModule } from '@angular/material/tooltip';
import { SelectableModel } from '@core/models/common/selectable.model';
import { EmptyDataComponent } from '@shared/components/empty-data/empty-data.component';

@Component({
  selector: 'app-selected-checkbox',
  imports: [EmptyDataComponent, MatCheckboxModule, MatTooltipModule],
  templateUrl: './selected-checkbox.component.html',
  styleUrl: './selected-checkbox.component.scss',
})
export class SelectedCheckboxComponent<T extends SelectableModel> {
  @Input() element: T | undefined;
  @Input() disabled = false;
  checkChange = output<boolean>();

  public onChange(event: MatCheckboxChange) {
    if (this.disabled) return;
    if (this.element) {
      this.element.isSelected = event.checked;
      this.checkChange.emit(event.checked);
    }
  }
}
