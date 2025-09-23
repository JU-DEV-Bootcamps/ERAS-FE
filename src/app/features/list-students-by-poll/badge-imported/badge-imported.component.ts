import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { StudentModel } from '@core/models/student.model';
import { EmptyDataComponent } from '../../../shared/components/empty-data/empty-data.component';

@Component({
  selector: 'app-badge-imported',
  templateUrl: './badge-imported.component.html',
  styleUrl: './badge-imported.component.css',
  imports: [MatIconModule, CommonModule, EmptyDataComponent],
})
export class BadgeImportedComponent {
  @Input() element: StudentModel | undefined;
}
