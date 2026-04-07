import { Component, Input } from '@angular/core';
import {
  MatCheckboxChange,
  MatCheckboxModule,
} from '@angular/material/checkbox';
import { StudentModel } from '@core/models/student.model';
import { EmptyDataComponent } from '@shared/components/empty-data/empty-data.component';

@Component({
  selector: 'app-selected-checkbox',
  imports: [EmptyDataComponent, MatCheckboxModule],
  templateUrl: './selected-checkbox.component.html',
  styleUrl: './selected-checkbox.component.scss',
})
export class SelectedCheckboxComponent {
  @Input() element: StudentModel | undefined;

  public onChange(event: MatCheckboxChange) {
    if (this.element) {
      this.element.isSelected = event.checked;
    }
  }
}
