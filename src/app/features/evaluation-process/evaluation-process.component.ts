import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { EvaluationProcessListComponent } from './evaluation-process-list/evaluation-process-list.component';

@Component({
  selector: 'app-evaluation-process',
  imports: [MatButtonModule, EvaluationProcessListComponent],
  templateUrl: './evaluation-process.component.html',
  styleUrl: './evaluation-process.component.scss',
})
export class EvaluationProcessComponent {
  // readonly dialog = inject(MatDialog);
  // evaluationProcessList: ReadEvaluationProcess[] = [];
  /*
  openModalNewEvaluationProcess(): void {
    const buttonElement = document.activeElement as HTMLElement;
    buttonElement.blur(); // Remove focus from the button - avoid console warning
    this.dialog.open(EvaluationProcessFormComponent, {
      width: '450px',
      maxWidth: '90vw',
      data: {},
    });
  }
    */
}
