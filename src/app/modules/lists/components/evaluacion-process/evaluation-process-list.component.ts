import { Component, HostListener, inject, OnInit } from '@angular/core';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';

import { ActionDatas } from '@shared/components/list/types/action';
import { Column } from '@shared/components/list/types/column';
import { DialogType } from '@shared/components/modals/modal-dialog/types/dialog';
import { EvaluationModel } from '@core/models/evaluation.model';
import { EventAction, EventLoad } from '@core/models/load';
import { PagedReadEvaluationProcess } from '@core/models/evaluation-request.model';
import { Status } from '@core/constants/common';
import { TYPE_TITLE } from '@core/constants/messages';

import { getStatusForEvaluationProcess } from '../../utils/evaluations.util';
import { MODAL_DEFAULT_CONF } from '@core/constants/modal';
import { RangeTimestampPipe } from '@shared/pipes/range-timestamp.pipe';

import { EvaluationsService } from '@core/services/api/evaluations.service';

import { BadgeStatusComponent } from './badge-status/badge-status.component';
import { ErasButtonComponent } from '@shared/components/buttons/eras-button/eras-button.component';
import { EvaluationProcessFormComponent } from './evaluation-process-form/evaluation-process-form.component';
import { ListComponent } from '@shared/components/list/list.component';
import { ModalComponent } from '@shared/components/modals/modal-dialog/modal-dialog.component';
import { ActivatedRoute, Router } from '@angular/router';
import { RouteDataService } from '@core/services/route-data.service';
import { ModalImportAnswersFormComponent } from '@modules/lists/components/modal-import-answers-form/modal-import-answers-form.component';
import { PreselectedPoll } from '@modules/imports/models/preselected-poll';

@Component({
  selector: 'app-evaluation-process-list',
  imports: [
    BadgeStatusComponent,
    ErasButtonComponent,
    ListComponent,
    MatButtonModule,
    MatCardModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatTableModule,
    MatTooltipModule,
  ],
  templateUrl: './evaluation-process-list.component.html',
})
export class EvaluationProcessListComponent implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private readonly dialog = inject(MatDialog);
  private routeDataService = inject(RouteDataService);

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
      text: 'Edit evaluation',
    },
    {
      columnId: 'actions',
      id: 'goImport',
      label: 'Actions',
      ngIconName: 'drive_file_move',
      text: 'Go to import',
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
        'warning',
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
          this.openAlertDialog('Evaluation deleted! ', 'success');
          this._updatePaginator();
          this.getEvaluationProcess();
        },
        error: err => {
          this.openAlertDialog(
            'Error: An error occurred while trying to delete the new evaluation process : ' +
              err.message,
            'error'
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
            'error'
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
    this.dialog
      .open(ModalImportAnswersFormComponent, {
        ...MODAL_DEFAULT_CONF,
        panelClass: 'border-modalbox-dialog',
        data: {
          evaluationId: data.id,
          pollName: data.pollName,
          endDate: data.endDate,
          startDate: data.startDate,
          configurationId: data.configurationId,
        },
      })
      .afterClosed()
      .subscribe((result: PreselectedPoll) => {
        if (result) {
          this.routeDataService.updateRouteData({
            evaluationId: data.id,
            configuration: result.configuration,
            pollName: result.pollName,
            startDate: result.startDate,
            endDate: result.endDate,
          });

          this.router.navigate(['import-preview'], {
            relativeTo: this.route,
          });
        }
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
    type: DialogType,
    deleteConfirmFunction?: () => void
  ): void {
    const buttonElement = document.activeElement as HTMLElement;
    buttonElement.blur(); // Remove focus from the button - avoid console warning
    const title = TYPE_TITLE[type];
    const data = {
      type,
      title,
      details: [descriptionMessage],
      data: {
        title,
        message: descriptionMessage,
      },
      ...(deleteConfirmFunction && {
        action: {
          label: 'Delete',
          action: deleteConfirmFunction,
        },
      }),
    };

    this.dialog.open(ModalComponent, {
      ...MODAL_DEFAULT_CONF,
      data,
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

  private _updatePaginator() {
    this.totalEvaluations = Math.max(0, this.totalEvaluations - 1);
    const totalPages = Math.ceil(this.totalEvaluations / this.pageSize);

    if (this.currentPage >= totalPages && this.currentPage > 0) {
      this.currentPage -= 1;
    }
  }
}
