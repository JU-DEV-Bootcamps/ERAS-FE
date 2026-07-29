import {
  Component,
  computed,
  effect,
  HostListener,
  inject,
  OnInit,
  untracked,
} from '@angular/core';

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
import { CosmicLatteService } from '@core/services/api/cosmic-latte.service';
import { ToastNotificationService } from '@core/services/toast-notification.service';
import { ModalImportAnswersFormComponent } from '@modules/lists/components/modal-import-answers-form/modal-import-answers-form.component';
import { PreselectedPoll } from '@modules/imports/models/preselected-poll';
import { Pagination } from '@core/services/interfaces/server.type';
import { FeatureFlagsService } from '@core/components/feature-flags/feature-flags.service';
import { RouteDataService } from '@core/services/route-data.service';
import { FEATURE_FLAGS } from '@core/components/feature-flags/feature-flags';
import {
  STATUS_COLORS,
  STATUS_EVALUATIONS,
  STATUS_LABEL_COLORS,
  TOOLTIP_EVALUATIONS,
} from '@core/constants/StatusEvaluation';

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
  styleUrls: [
    '../../../home-v2/recent-alerts/recent-alerts.component.scss',
    './evaluation-process-list.component.scss',
  ],
})
export class EvaluationProcessListComponent implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private readonly dialog = inject(MatDialog);
  private cosmicLatteService = inject(CosmicLatteService);
  private toast = inject(ToastNotificationService);
  private featureFlagsService = inject(FeatureFlagsService);
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
      tooltip: '',
      ngIconName: 'edit',
      text: 'Edit evaluation',
    },
    {
      columnId: 'actions',
      id: 'goImport',
      label: 'Actions',
      tooltip: '',
      ngIconName: 'drive_file_move',
      text: 'New Import',
      isVisible: this.isVisible.bind(this),
      isDisabled: (item: EvaluationModel) => item.pollName.trim() === '',
    },
    {
      columnId: 'actions',
      id: 'viewImport',
      label: 'Actions',
      tooltip: '',
      ngIconName: 'visibility',
      text: 'View Import',
      isVisible: () =>
        this.featureFlagsService.isEnabled(FEATURE_FLAGS.reportsV2),
      isDisabled: (item: EvaluationModel) => !item.latestImportJobId,
    },
  ];
  evaluationProcessList: EvaluationModel[] = [];
  totalEvaluations = 0;
  isMobile = false;
  isLoading = false;
  importPollsDisabled = [Status.INCOMPLETE, Status.NOT_STARTED];
  pagination: Pagination = {
    page: 0,
    pageSize: 10,
  };
  displayV2 = computed(() =>
    this.featureFlagsService.isEnabled(FEATURE_FLAGS.reportsV2)
  );

  @HostListener('window:resize', ['$event'])
  onResize(event: UIEvent): void {
    const target = event.target as Window;
    this.isMobile = target.innerWidth < 600;
  }

  ngOnInit(): void {
    this.isMobile = window.innerWidth < 600;
  }

  constructor() {
    effect(() => {
      this.displayV2();
      untracked(() => {
        this.getEvaluationProcess();
      });
    });
  }

  handleLoadCalled(event: EventLoad) {
    this.pagination = {
      page: event.page,
      pageSize: event.pageSize,
    };
    this.getEvaluationProcess();
  }

  handleActionCalled(event: EventAction) {
    const actions: Record<string, (item: EvaluationModel) => void> = {
      goImport: (element: EvaluationModel) => this.goToImport(element),
      openModalDetails: (element: EvaluationModel) =>
        this.openModalDetails(element),
      viewImport: (element: EvaluationModel) => this.viewImport(element),
    };

    if (actions[event.data.id]) {
      actions[event.data.id](event.item as EvaluationModel);
    }
  }

  viewImport(data: EvaluationModel): void {
    if (!data.latestImportJobId) return;

    this.router.navigate(['import-status', data.latestImportJobId], {
      relativeTo: this.route,
    });
  }

  deleteEvaluationConfirmation(id: number) {
    this.openAlertDialog(
      `Are you sure you want to delete the evaluation?`,
      'warning',
      () => this.deleteEvaluation(id)
    );
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

  getEvaluationProcess() {
    this.isLoading = true;
    this.evaluationProcessService.getAllEvalProc(this.pagination).subscribe({
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
        if (!result) return;
        // Kick off the background extraction and go straight to the unified import view, which
        // shows extraction progress and then the confirm/import step (no synchronous preview).

        if (this.featureFlagsService.isEnabled(FEATURE_FLAGS.reportsV2)) {
          this.cosmicLatteService
            .startExtraction({
              evaluationSetName: result.pollName,
              configurationId: result.configuration.id,
              startDate: result.startDate,
              endDate: result.endDate,
              evaluationId: data.id,
            })
            .subscribe({
              next: res =>
                this.router.navigate(['import-status', res.importJobId], {
                  relativeTo: this.route,
                }),
              error: err => {
                if (err.status === 400) {
                  this.toast.showToast({
                    type: 'error',
                    title: 'Import failed',
                    message: `${err.error.message}`,
                  });
                } else {
                  this.toast.showToast({
                    type: 'error',
                    title: 'Import',
                    message: 'Could not start the import extraction.',
                  });
                }
              },
            });
        } else {
          this.routeDataService.updateRouteData({
            evaluationId: data.id,
            configuration: result.configuration,
            pollName: result.pollName,
            startDate: result.startDate,
            endDate: result.endDate,
          });

          this.router.navigate(['import-preview'], { relativeTo: this.route });
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
    if (this.displayV2()) {
      return data;
    }
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

  getStatusLabel(status: string): string {
    return STATUS_EVALUATIONS[status] ?? STATUS_EVALUATIONS['default'];
  }

  getStatusTooltip(status: string): string {
    return TOOLTIP_EVALUATIONS[status] ?? TOOLTIP_EVALUATIONS['default'];
  }

  getStatusColor(status: string): string {
    return STATUS_COLORS[status] ?? STATUS_COLORS['default'];
  }

  getStatusLabelColor(status: string): string {
    return STATUS_LABEL_COLORS[status] ?? STATUS_LABEL_COLORS['default'];
  }

  private _updatePaginator() {
    this.totalEvaluations = Math.max(0, this.totalEvaluations - 1);
    const totalPages = Math.ceil(
      this.totalEvaluations / this.pagination.pageSize
    );

    if (this.pagination.page >= totalPages && this.pagination.page > 0) {
      this.pagination.page -= 1;
    }
  }
}
