import { Component, input } from '@angular/core';
import { StudentModel } from '../../../core/models/StudentModel';
import { MatCardContent } from '@angular/material/card';
import {
  MatCell,
  MatHeaderCell,
  MatHeaderRow,
  MatRow,
  MatTable,
} from '@angular/material/table';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'app-student-risklevel-table',
  imports: [
    MatCardContent,
    MatTable,
    MatCell,
    MatIcon,
    MatHeaderCell,
    MatHeaderRow,
    MatRow,
  ],
  templateUrl: './student-risklevel-table.component.html',
  styleUrl: './student-risklevel-table.component.css',
})
export class StudentRisklevelTableComponent {
  studentRisk = input<{ Student: StudentModel; riskLevel: number }[]>([]);
}
