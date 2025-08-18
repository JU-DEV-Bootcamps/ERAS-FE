import { NgIf } from '@angular/common';
import { Component, HostListener, inject, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog } from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router } from '@angular/router';
import { GENERAL_MESSAGES } from '../../../../core/constants/messages';
import { PagedReadEvaluationProcess } from '../../../../core/models/evaluation-request.model';
import { EvaluationModel } from '../../../../core/models/evaluation.model';
import { ModalComponent } from '../../../../shared/components/modal-dialog/modal-dialog.component';
import { EvaluationProcessFormComponent } from '../../components/evaluation-process-form/evaluation-process-form.component';
import { EmptyDataComponent } from '../../../../shared/components/empty-data/empty-data.component';
import { EvaluationsService } from '../../../../core/services/api/evaluations.service';
import { Status } from '../../../../core/constants/common';
import { getStatusForEvaluationProcess } from '../../utils/evaluations.util';
import { Column } from '../../../../shared/components/list/types/column';
import { ActionDatas } from '../../../../shared/components/list/types/action';
import { ListComponent } from '../../../../shared/components/list/list.component';
import { EventAction, EventLoad } from '../../../../shared/events/load';
import { RangeTimestampPipe } from '../../../../shared/pipes/range-timestamp.pipe';
import { BadgeStatusComponent } from './badge-status/badge-status.component';
import { MODAL_DEFAULT_CONF } from '../../../../core/constants/modal';

@Component({
  selector: 'app-evaluation-process-list',
  imports: [
    MatProgressSpinnerModule,
    MatTableModule,
    MatCardModule,
    NgIf,
    MatChipsModule,
    MatButtonModule,
    MatIcon,
    MatTooltipModule,
    EmptyDataComponent,
    ListComponent,
    BadgeStatusComponent,
  ],
  templateUrl: './evaluation-process-list.component.html',
  styleUrl: './evaluation-process-list.component.scss',
})
export class EvaluationProcessListComponent implements OnInit {
  readonly dialog = inject(MatDialog);
  evaluationProcessService = inject(EvaluationsService);
  columns: Column<EvaluationModel>[] = [
    {
      key: 'id',
      label: 'Id',
    },
    {
      key: 'name',
      label: 'Name',
    },
    {
      key: 'country',
      label: 'Country',
    },
    {
      key: 'pollName',
      label: 'Poll Name',
    },
    {
      key: 'startDate',
      label: 'Period',
      pipe: new RangeTimestampPipe(),
    },
  ];
  columnTemplates: Column<EvaluationModel>[] = [
    {
      key: 'status',
      label: 'Status',
    },
  ];
  actionDatas: ActionDatas<EvaluationModel> = [
    {
      columnId: 'actions',
      id: 'openModalDetails',
      label: 'Actions',
      ngIconName: 'edit',
      tooltip: 'Edit evaluation',
    },
    {
      columnId: 'actions',
      id: 'goImport',
      label: 'Actions',
      ngIconName: 'drive_file_move',
      tooltip: 'Go to import',
      isVisible: this.isVisible.bind(this),
    },
  ];
  evaluationProcessList: EvaluationModel[] = [];
  pageSize = 5;
  currentPage = 0;
  totalEvaluations = 0;
  isMobile = false;
  isLoading = false;
  importPollsDisabled = [Status.INCOMPLETE, Status.NOT_STARTED];

  router = inject(Router);

  @HostListener('window:resize', ['$event'])
  onResize(event: UIEvent): void {
    const target = event.target as Window;
    this.isMobile = target.innerWidth < 600;
  }

  ngOnInit(): void {
    this.isMobile = window.innerWidth < 600;
  }

  handleLoadCalled(event: EventLoad) {
    this.currentPage = event.page;
    this.pageSize = event.pageSize;
    this.getEvaluationProcess();
  }

  handleActionCalled(event: EventAction) {
    const actions: Record<string, (item: EvaluationModel) => void> = {
      goImport: (element: EvaluationModel) => {
        this.goToImport(element);
      },
      openModalDetails: (element: EvaluationModel) => {
        this.openModalDetails(element);
      },
    };

    if (actions[event.data.id]) {
      actions[event.data.id](event.item as EvaluationModel);
    }
  }

  getClassName(value: string): string {
    return value ? value.replace(/\s+/g, '_') : '';
  }
  deleteEvaluationConfirmation(id: number) {
    if (id) {
      this.openAlertDialog(
        `Are you sure you want to delete the evaluation?`,
        false,
        () => this.deleteEvaluation(id)
      );
    } else {
      console.warn("id wasn't provided");
    }
  }
  deleteEvaluation(id: number) {
    this.evaluationProcessService
      .deleteEvaluationProcess(id.toString())
      .subscribe({
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

  goToImport(data: EvaluationModel) {
    this.router.navigate(['import-answers'], {
      state: {
        pollName: data.pollName,
        country: data.country,
        endDate: data.endDate,
        startDate: data.startDate,
      },
    });
  }

  openModalDetails(data: EvaluationModel): void {
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
    deleteConfirmFunction?: () => void
  ): void {
    const buttonElement = document.activeElement as HTMLElement;
    buttonElement.blur(); // Remove focus from the button - avoid console warning
    this.dialog.open(ModalComponent, {
      ...MODAL_DEFAULT_CONF,
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
  normalizeData(data: EvaluationModel[]): EvaluationModel[] {
    const statusTransformed = this.transformStatus(data);
    return this.adaptDataToColumNames(statusTransformed);
  }
  adaptDataToColumNames(data: EvaluationModel[]): EvaluationModel[] {
    data.forEach((evaluation: EvaluationModel) => {
      evaluation.country = evaluation.country.toUpperCase();
      evaluation.pollName = evaluation.pollName ?? 'Not selected yet';
    });
    return data;
  }
  transformStatus(data: EvaluationModel[]): EvaluationModel[] {
    data.forEach((evaluation: EvaluationModel) => {
      evaluation.status = getStatusForEvaluationProcess(evaluation);
    });
    return data;
  }

  getInfo(element: EvaluationModel, column: string) {
    return element[column as keyof EvaluationModel];
  }

  isVisible(item: EvaluationModel) {
    return !this.importPollsDisabled.includes(item.status);
  }
}
