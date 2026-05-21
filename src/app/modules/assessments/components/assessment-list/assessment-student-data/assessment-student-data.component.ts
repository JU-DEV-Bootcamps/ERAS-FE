import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-assessment-student-data',
  imports: [],
  templateUrl: './assessment-student-data.component.html',
  styleUrl: './assessment-student-data.component.scss',
})
export class AssessmentStudentDataComponent {
  @Input({ required: true }) studentData!: string[];
}
