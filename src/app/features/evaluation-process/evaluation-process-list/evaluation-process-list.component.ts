import { Component, HostListener, inject, OnInit } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTable, MatTableModule } from '@angular/material/table';
import { EvaluationProcessService } from '../../../core/services/evaluation-process.service';
import { MatDialog } from '@angular/material/dialog';
import { GENERAL_MESSAGES } from '../../../core/constants/messages';
import { ModalComponent } from '../../../shared/components/modal-dialog/modal-dialog.component';
import { MatCardModule } from '@angular/material/card';
import { DatePipe, NgClass, NgFor, NgIf, TitleCasePipe } from '@angular/common';
import { MatChipsModule } from '@angular/material/chips';
import { EvaluationProcessFormComponent } from '../evaluation-process-form/evaluation-process-form.component';
import {
  PagedReadEvaluationProcess,
  ReadEvaluationProcess,
} from '../../../shared/models/EvaluationProcess';
import { MatButtonModule } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router } from '@angular/router';

@Component({
  selector: 'app-evaluation-process-list',
  imports: [
    MatProgressSpinnerModule,
    MatPaginator,
    MatTableModule,
    MatCardModule,
    NgFor,
    NgIf,
    MatTable,
    TitleCasePipe,
    MatChipsModule,
    NgClass,
    DatePipe,
    MatButtonModule,
    MatIcon,
    MatTooltipModule,
  ],
  providers: [DatePipe],
  templateUrl: './evaluation-process-list.component.html',
  styleUrl: './evaluation-process-list.component.scss',
})
export class EvaluationProcessListComponent implements OnInit {
  readonly dialog = inject(MatDialog);
  evaluationProcessService = inject(EvaluationProcessService);
  columns: string[] = ['id', 'name', 'country', 'poll', 'period', 'status'];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  evaluationProcessList: any = [];
  pageSize = 5;
  currentPage = 0;
  totalEvaluations = 0;
  isMobile = false;
  isLoading = false;

  constructor(private datePipe: DatePipe) {}
  router = inject(Router);

  @HostListener('window:resize', ['$event'])
  onResize(event: UIEvent): void {
    const target = event.target as Window;
    this.isMobile = target.innerWidth < 600;
  }
  ngOnInit(): void {
    this.getEvaluationProcess();
    this.isMobile = window.innerWidth < 600;
  }
  getClassName(value: string): string {
    return value ? value.replace(/\s+/g, '_') : '';
  }
  deleteEvaluationConfirmation(id: string) {
    this.openAlertDialog(
      `Are you sure you want to delete the evaluation?`,
      false,
      () => this.deleteEvaluation(id)
    );
  }
  deleteEvaluation(id: string) {
    this.evaluationProcessService.deleteEvaluationProcess(id).subscribe({
      next: () => {
        this.openAlertDialog('Evaluation deleted! ', true);
        this.getEvaluationProcess();
      },
      error: err => {
        this.openAlertDialog(
          'Error: An error occurred while trying to delete the new evaluation process : ' +
            err.message,
          false
        );
      },
    });
  }
  onPageChange({
    pageSize,
    pageIndex,
  }: {
    pageIndex: number;
    pageSize: number;
  }): void {
    this.currentPage = pageIndex;
    this.pageSize = pageSize;
    this.getEvaluationProcess();
  }
  getEvaluationProcess() {
    this.isLoading = true;
    this.evaluationProcessService
      .getAllEvalProc({
        page: this.currentPage,
        pageSize: this.pageSize,
      })
      .subscribe({
        next: (data: PagedReadEvaluationProcess) => {
          this.evaluationProcessList = this.normalizeData(data.items);
          this.totalEvaluations = data.count;
          this.isLoading = false;
        },
        error: err => {
          this.openAlertDialog(
            'Error: An error occurred while trying to access information : ' +
              err.message,
            false
          );
          this.isLoading = false;
        },
      });
  }
  openModalNewEvaluationProcess(): void {
    const buttonElement = document.activeElement as HTMLElement;
    buttonElement.blur(); // Remove focus from the button - avoid console warning
    this.dialog.open(EvaluationProcessFormComponent, {
      width: '450px',
      maxWidth: '90vw',
      data: {
        updateFunction: this.getEvaluationProcess.bind(this),
      },
    });
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  goToImport(data: any) {
    this.router.navigate(['import-answers'], {
      state: {
        pollName: data.pollName,
        country: data.country,
        endDate: data.endDate,
        startDate: data.startDate,
      },
    });
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  openModalDetails(data: any): void {
    const buttonElement = document.activeElement as HTMLElement;
    buttonElement.blur(); // Remove focus from the button - avoid console warning
    this.dialog.open(EvaluationProcessFormComponent, {
      width: '450px',
      maxWidth: '90vw',
      height: 'auto',
      data: {
        evaluation: data,
        title: 'Edit evaluation',
        buttonText: 'Update!',
        deleteFunction: this.deleteEvaluationConfirmation.bind(this),
        updateFunction: this.getEvaluationProcess.bind(this),
      },
    });
  }
  openAlertDialog(
    descriptionMessage: string,
    isSuccess: boolean,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    deleteConfirmFunction?: any
  ): void {
    const buttonElement = document.activeElement as HTMLElement;
    buttonElement.blur(); // Remove focus from the button - avoid console warning
    this.dialog.open(ModalComponent, {
      width: '450px',
      height: 'auto',
      maxWidth: '90vw',
      maxHeight: '90vh',
      data: {
        isSuccess: isSuccess,
        title: isSuccess
          ? GENERAL_MESSAGES.SUCCESS_TITLE
          : GENERAL_MESSAGES.ERROR_TITLE,
        success: {
          details: descriptionMessage,
        },
        error: {
          title: GENERAL_MESSAGES.ERROR_TITLE,
          details: [descriptionMessage],
          message: descriptionMessage,
        },
        deleteConfirmFunction: deleteConfirmFunction,
      },
    });
  }
  normalizeData(data: ReadEvaluationProcess[]): ReadEvaluationProcess[] {
    const statusTransformed = this.transformStatus(data);
    return this.adaptDataToColumNames(statusTransformed);
  }
  adaptDataToColumNames(
    data: ReadEvaluationProcess[]
  ): ReadEvaluationProcess[] {
    /* eslint-disable @typescript-eslint/no-explicit-any */
    data.forEach((evaluation: any) => {
      evaluation.start = evaluation.startDate;
      evaluation.end = evaluation.endDate;
      evaluation.poll = evaluation.pollName
        ? evaluation.pollName
        : 'Not selected yet';
    });
    return data;
  }
  transformStatus(data: ReadEvaluationProcess[]): ReadEvaluationProcess[] {
    /* eslint-disable @typescript-eslint/no-explicit-any */
    data.forEach((evaluation: any) => {
      evaluation.status = this.getStatusForEvaluationProcess(evaluation);
    });
    return data;
  }
  getStatusForEvaluationProcess(evaluation: ReadEvaluationProcess): string {
    if (
      evaluation.pollName == null ||
      evaluation.pollName == '' ||
      evaluation.status == 'Incompleted'
    ) {
      return 'Incomplete';
    }

    const now = Date.now();
    const startTime = new Date(evaluation.startDate).getTime();
    const endTime = new Date(evaluation.endDate).getTime();

    if (now < startTime) {
      return 'Not started yet';
    } else if (now >= startTime && now < endTime) {
      return 'In progress';
    } else {
      return 'Finished';
    }
  }
}
