import { Component } from '@angular/core';
import { StudentsRiskComponent } from '../students-risk/students-risk.component';

@Component({
  selector: 'app-cohort',
  imports: [StudentsRiskComponent],
  templateUrl: './cohort.component.html',
  styleUrl: './cohort.component.css',
})
export class CohortComponent {}
