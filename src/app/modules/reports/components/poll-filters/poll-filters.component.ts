import {
  Component,
  DestroyRef,
  Input,
  OnInit,
  ViewChild,
  inject,
  output,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import {
  MatSelect,
  MatSelectChange,
  MatSelectModule,
} from '@angular/material/select';

import { CohortModel } from '@core/models/cohort.model';
import { PollModel } from '@core/models/poll.model';
import { VariableModel } from '@core/models/variable.model';

import { areArraysEqual } from '@core/utils/helpers/are-arrays-equal';
import { SelectAllDirective } from '@shared/directives/select-all.directive';

import { CohortService } from '@core/services/api/cohort.service';
import { PollService } from '@core/services/api/poll.service';
import { SelectedItemsComponent } from './selected-items/selected-items.component';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { EvaluationsService } from '@core/services/api/evaluations.service';
import { EvaluationModel } from '@core/models/evaluation.model';
import { Pagination } from '@core/services/interfaces/server.type';

@Component({
  selector: 'app-poll-filters',
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatIconModule,
    CommonModule,
    SelectAllDirective,
    SelectedItemsComponent,
  ],
  templateUrl: './poll-filters.component.html',
  styleUrl: './poll-filters.component.scss',
})
export class PollFiltersComponent implements OnInit {
  @Input() showVariables = true;
  @ViewChild('evaluationSelect') evaluationSelect!: MatSelect;

  private cohortsService = inject(CohortService);
  private destroyRef = inject(DestroyRef);
  private pollsService = inject(PollService);
  private evaluationsService = inject(EvaluationsService);

  cohorts: CohortModel[] = [];
  componentNames: string[] = [];
  evaluations: EvaluationModel[] | null = [];
  polls: PollModel[] = [];
  prevCohortIds: number[] = [];
  prevComponentSelections: string[] = [];
  prevVariablesSelections: number[] = [];
  variableGroups: VariableModel[][] = [];
  variables: VariableModel[] = [];
  variablesClone: VariableModel[] = [];

  pagination: Pagination = {
    page: 0,
    pageSize: 10,
  };
  isLoadingMore = false;
  totalEvaluations = 0;

  filters = output<{
    title: string;
    uuid: string;
    cohortIds: number[];
    variableIds: number[];
    lastVersion: boolean;
  }>();

  filterForm = new FormGroup({
    selectedEvaluation: new FormControl<EvaluationModel | null>(null, [
      Validators.required,
    ]),
    cohortIds: new FormControl<number[] | null>([], null),
    componentNames: new FormControl<string[] | null>(null, [
      Validators.required,
    ]),
    variables: new FormControl<number[] | null>(null, [Validators.required]),
  });

  ngOnInit() {
    this._loadEvaluations();
  }

  handleEvaluationDropdownOpen(isOpen: boolean) {
    if (!isOpen) return;
    setTimeout(() => {
      const panel = this.evaluationSelect.panel?.nativeElement;
      if (!panel) return;
      panel.addEventListener('scroll', () => this._onPanelScroll(panel));
    });
  }

  handleEvaluationSelect(itemSelected: MatSelectChange) {
    const newSelectedEvaluation: EvaluationModel = itemSelected.value;
    this._resetField('cohortIds');
    this._getPolls(newSelectedEvaluation);
    const newSelectedPoll = this.polls[0];
    if (!newSelectedPoll) return;
    this._getCohorts(newSelectedPoll.uuid);
  }

  handleCohortSelect(isOpen: boolean) {
    if (isOpen) return;
    const cohortIds = this.filterForm.value.cohortIds || [];
    if (areArraysEqual(this['prevCohortIds'], cohortIds)) return;
    this.prevCohortIds = [...cohortIds];

    this._getVariables();
  }

  handleComponentsSelect(isOpen: boolean) {
    if (isOpen) return;
    const componentNames = this.filterForm.value.componentNames || [];
    if (areArraysEqual(this.prevComponentSelections, componentNames)) return;
    this.prevComponentSelections = [...componentNames];

    if (!this.filterForm.value.componentNames?.length) {
      this.variableGroups = [];
      this._resetField('variables');
      this.variables = [];
      this._sendFilters();
      return;
    }

    this.variables = [];
    setTimeout(() => {
      this.variableGroups =
        this.filterForm.value.componentNames?.map(c =>
          this.variablesClone.filter(v => v.componentName === c)
        ) || [];

      this.variables = this.variableGroups.flat();
      this.filterForm.controls.variables.setValue(
        this.variableGroups.flat().map(v => v.pollVariableId)
      );
      this.prevVariablesSelections = this.variables.map(v => v.pollVariableId);
      this._sendFilters();
    });
  }

  handleVariableSelect(isOpen: boolean) {
    if (isOpen) return;
    const variables = this.filterForm.value.variables || [];
    if (areArraysEqual(this.prevVariablesSelections, variables)) return;
    this.prevVariablesSelections = [...variables];

    if (!this.filterForm.value.variables?.length) {
      this._resetField('variables');
    }
    this._sendFilters();
  }

  getCohortsSelection() {
    const cohortIds = this.filterForm.value.cohortIds?.filter(
      cohortId => !!cohortId
    );

    return cohortIds?.length === this.cohorts.length
      ? ['Select all']
      : cohortIds?.map(
          cohortId => this.cohorts.find(cohort => cohort.id === cohortId)?.name
        );
  }

  getComponentsSelection() {
    const componentNames = this.filterForm.value.componentNames?.filter(
      componentName => !!componentName
    );

    return componentNames?.length === this.componentNames.length
      ? ['Select all']
      : componentNames?.map(componentName =>
          this.componentNames.find(cN => cN === componentName)
        );
  }

  getAllVariableIds() {
    return this.variables.map(variable => variable.pollVariableId);
  }

  getVariablesSelection() {
    const variables = this.filterForm.value.variables?.filter(
      variable => !!variable
    );

    return variables?.length === this.variables.length
      ? ['Select all']
      : variables?.map(
          id => this.variables.find(v => v.pollVariableId === id)?.name
        );
  }

  private _loadEvaluations() {
    this.evaluationsService
      .getAllEvalProc(this.pagination)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: result => {
          this.evaluations = [...(this.evaluations ?? []), ...result.items];
          this.totalEvaluations = result.count;
          this.isLoadingMore = false;
        },
        error: () => (this.evaluations = null),
      });
  }

  private _getPolls(evaluation: EvaluationModel) {
    this.polls = evaluation.polls;
  }

  private _getCohorts(pollUuid: string) {
    this.cohorts = [];
    this.cohortsService.getCohorts(pollUuid).subscribe(response => {
      this.cohorts = response.body;
      this.filterForm.controls.cohortIds.setValue(
        this.cohorts.map(cohort => cohort.id)
      );
      this.prevCohortIds = this.filterForm.value.cohortIds || [];
      this.componentNames = [];
      this.variables = [];
      this.filterForm.controls.variables.reset();
      this._getVariables();
    });
  }

  private _getVariables() {
    if (!this.polls[0]?.uuid) return;
    this.componentNames = [];
    this.variables = [];
    this._resetField('variables');

    this.pollsService
      .getVariablesByComponents(
        this.polls[0].uuid,
        [...this.componentNames],
        true
      )
      .subscribe(variables => {
        this.variables = variables;
        this.variablesClone = [...this.variables];
        this.componentNames = [...new Set(variables.map(v => v.componentName))];
        this.prevComponentSelections = [...this.componentNames];

        this.variableGroups = this.componentNames.map(c =>
          variables.filter(v => v.componentName === c)
        );
        this.filterForm.controls.componentNames.setValue(this.componentNames);
        this.filterForm.controls.variables.setValue(
          this.variables.map(v => v.pollVariableId)
        );
        this.prevVariablesSelections = this.filterForm.value.variables || [];
        this._sendFilters();
      });
  }

  private _resetField(controlName: string) {
    this.filterForm.get(controlName)!.reset();
  }

  private _sendFilters() {
    if (!this.polls) return;
    const poll = this.polls.find(p => p.uuid === this.polls[0]?.uuid);
    const cohorts = this.filterForm.value.cohortIds || [];
    const title = `Poll: ${poll?.name} - Cohort(s): ${cohorts.map(cohortId => this.cohorts.find(c => c.id == cohortId)?.name)}`;
    const uuid = this.polls[0]?.uuid || '';
    const cohortIds = this.filterForm.value.cohortIds!.filter(Boolean);
    const variableIds = this.filterForm.value.variables || [];
    const lastVersion = true;

    this.filters.emit({ title, uuid, cohortIds, variableIds, lastVersion });
  }

  private _onPanelScroll(panel: HTMLElement) {
    const nearBottom =
      panel.scrollTop + panel.clientHeight >= panel.scrollHeight - 50;
    if (!nearBottom || this.isLoadingMore) return;
    const hasMore = (this.evaluations?.length ?? 0) < this.totalEvaluations;
    if (!hasMore) return;

    this.isLoadingMore = true;
    this.pagination = { page: this.pagination.page + 1, pageSize: 10 };
    this._loadEvaluations();
  }
}
