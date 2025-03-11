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
import { MatIcon } from '@angular/material/icon';

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
    MatIcon,
  ],
  providers: [DatePipe],
  templateUrl: './evaluation-process-list.component.html',
  styleUrl: './evaluation-process-list.component.scss',
})
export class EvaluationProcessListComponent implements OnInit {
  readonly dialog = inject(MatDialog);
  evaluationProcessService = inject(EvaluationProcessService);
  columns: string[] = ['Id', 'Name', 'pollName', 'start', 'end', 'status'];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  evaluationProcessList: any = [];
  pageSize = 10;
  currentPage = 0;
  totalEvaluations = 0;
  isMobile = false;
  totalItems = 0;

  constructor(private datePipe: DatePipe) {}

  @HostListener('window:resize', ['$event'])
  onResize(event: UIEvent): void {
    const target = event.target as Window;
    this.isMobile = target.innerWidth < 600;
  }
  ngOnInit(): void {
    this.getEvaluationProcess();

    this.isMobile = window.innerWidth < 600;

    // DELETE IT!
    // DELETE IT!
    // DELETE IT!
    // DELETE IT!
    // DELETE IT!
    // DELETE IT!
    // DELETE IT!
    // DELETE IT!
    const evaluationProcessListMock = [
      {
        Id: 'asdas',
        Name: 'current',
        StartDate: new Date(
          'Sat Mar 01 2025 00:00:00 GMT-0300 (hora estándar de Argentina)'
        ),
        EndDate: new Date(
          'Sat Mar 29 2025 00:00:00 GMT-0300 (hora estándar de Argentina)'
        ),
        PollId: '$eutyasd-ID-CL-POLL-afser',
        EvaluationPollId: 1,
        pollName: 'Encuesta desde CLLLLL',
        status: null,
      },
      {
        Id: 'asdas',
        Name: 'pasada',
        StartDate: new Date(
          'Sat Mar 01 2024 00:00:00 GMT-0300 (hora estándar de Argentina)'
        ),
        EndDate: new Date(
          'Sat Mar 29 2024 00:00:00 GMT-0300 (hora estándar de Argentina)'
        ),
        PollId: '$eutyasd-ID-CL-POLL-afser',
        EvaluationPollId: 1,
        pollName: 'Encuesta desde CLLLLL',
        status: null,
      },
      {
        Id: 'asdas',
        Name: 'A futuro',
        StartDate: new Date(
          'Sat Mar 28 2025 00:00:00 GMT-0300 (hora estándar de Argentina)'
        ),
        EndDate: new Date(
          'Sat Mar 29 2025 00:00:00 GMT-0300 (hora estándar de Argentina)'
        ),
        PollId: '$eutyasd-ID-CL-POLL-afser',
        EvaluationPollId: 1,
        pollName: 'Encuesta desde CLLLLL',
        status: null,
      },
      {
        Id: 'asdas',
        Name: 'Incompleta',
        StartDate: new Date(
          'Sat Mar 28 2025 00:00:00 GMT-0300 (hora estándar de Argentina)'
        ),
        EndDate: new Date(
          'Sat Mar 29 2025 00:00:00 GMT-0300 (hora estándar de Argentina)'
        ),
        PollId: '$eutyasd-ID-CL-POLL-afser',
        EvaluationPollId: 1,
        pollName: null,
        status: null,
      },
      {
        Id: 'asdas',
        Name: 'current',
        StartDate: new Date(
          'Sat Mar 01 2025 00:00:00 GMT-0300 (hora estándar de Argentina)'
        ),
        EndDate: new Date(
          'Sat Mar 29 2025 00:00:00 GMT-0300 (hora estándar de Argentina)'
        ),
        PollId: '$eutyasd-ID-CL-POLL-afser',
        EvaluationPollId: 1,
        pollName: 'Encuesta desde CLLLLL',
        status: null,
      },
      {
        Id: 'asdas',
        Name: 'pasada',
        StartDate: new Date(
          'Sat Mar 01 2024 00:00:00 GMT-0300 (hora estándar de Argentina)'
        ),
        EndDate: new Date(
          'Sat Mar 29 2024 00:00:00 GMT-0300 (hora estándar de Argentina)'
        ),
        PollId: '$eutyasd-ID-CL-POLL-afser',
        EvaluationPollId: 1,
        pollName: 'Encuesta desde CLLLLL',
        status: null,
      },
      {
        Id: 'asdas',
        Name: 'A futuro',
        StartDate: new Date(
          'Sat Mar 28 2025 00:00:00 GMT-0300 (hora estándar de Argentina)'
        ),
        EndDate: new Date(
          'Sat Mar 29 2025 00:00:00 GMT-0300 (hora estándar de Argentina)'
        ),
        PollId: '$eutyasd-ID-CL-POLL-afser',
        EvaluationPollId: 1,
        pollName: 'Encuesta desde CLLLLL',
        status: null,
      },
      {
        Id: 'asdas',
        Name: 'Incompleta',
        StartDate: new Date(
          'Sat Mar 28 2025 00:00:00 GMT-0300 (hora estándar de Argentina)'
        ),
        EndDate: new Date(
          'Sat Mar 29 2025 00:00:00 GMT-0300 (hora estándar de Argentina)'
        ),
        PollId: '$eutyasd-ID-CL-POLL-afser',
        EvaluationPollId: 1,
        pollName: null,
        status: null,
      },
    ];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    evaluationProcessListMock.forEach((evaluation: any) => {
      evaluation.start = this.formatDate(evaluation.StartDate);
      evaluation.end = this.formatDate(evaluation.EndDate);
      evaluation.status = this.getStatusForEvaluationProcess(evaluation);
    });
    this.evaluationProcessList = evaluationProcessListMock;
    this.totalItems = this.evaluationProcessList.length;
    // DELETE IT!
    // DELETE IT!
    // DELETE IT!
    // DELETE IT!
    // DELETE IT!
    // DELETE IT!
    // DELETE IT!
    // DELETE IT!
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getStatusForEvaluationProcess(evaluation: any): string {
    if (evaluation.pollName == null) {
      return 'Incomplete';
    }
    const now = Date.now();
    const startTime = new Date(evaluation.StartDate).getTime();
    const endTime = new Date(evaluation.EndDate).getTime();

    if (now < startTime) {
      return 'Not started yet';
    } else if (now >= startTime && now < endTime) {
      return 'In progress';
    } else {
      return 'Finished';
    }
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
          'Error: An error occurred while trying to create the new evaluation process : ' +
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
    /*
    this.evaluationProcessService.getAllEvalProc().subscribe({
      next: (data: ReadEvaluationProcess[]) => {
        console.log('GET ALL EVALUTAION PROCESS FOR LIST');
        console.log(data);
        this.transformDate();
        this.evaluationProcessList = data;
      },
      error: err => {
        this.openAlertDialog(
          'Error: An error occurred while trying to create the new evaluation process : ' +
            err.message,
          false
        );
      },
    });
    */
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
  transformDate() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.evaluationProcessList.forEach((evaluation: any) => {
      evaluation.StartDate = this.formatDate(evaluation.StartDate);
      evaluation.EndDate = this.formatDate(evaluation.EndDate);
    });
  }
  formatDate(date: Date): string {
    if (isNaN(date.getTime())) {
      return '';
    }
    return this.datePipe.transform(date, 'yyyy-MM-dd') || '';
  }
}
