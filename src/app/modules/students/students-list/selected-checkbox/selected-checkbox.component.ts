import { Component, Input, output } from '@angular/core';
import {
  MatCheckboxChange,
  MatCheckboxModule,
} from '@angular/material/checkbox';
import { SelectableModel } from '@core/models/common/selectable.model';
import { EmptyDataComponent } from '@shared/components/empty-data/empty-data.component';

@Component({
  selector: 'app-selected-checkbox',
  imports: [EmptyDataComponent, MatCheckboxModule],
  templateUrl: './selected-checkbox.component.html',
  styleUrl: './selected-checkbox.component.scss',
})
export class SelectedCheckboxComponent<T extends SelectableModel> {
  @Input() element: T | undefined;
  checkChange = output<boolean>();

  public onChange(event: MatCheckboxChange) {
    if (this.element) {
      this.element.isSelected = event.checked;
      this.checkChange.emit(event.checked);
    }
  }
}
