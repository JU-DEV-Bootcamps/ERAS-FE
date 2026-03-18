import {
  Component,
  DestroyRef,
  Input,
  OnInit,
  ViewChild,
  inject,
  output,
  computed,
  signal,
} from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
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

import { CohortService } from '@core/services/api/cohort.service';
import { PollService } from '@core/services/api/poll.service';

import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { EvaluationsService } from '@core/services/api/evaluations.service';
import { EvaluationModel } from '@core/models/evaluation.model';
import { Pagination } from '@core/services/interfaces/server.type';
// import { SelectVirtualScrollComponent } from '@shared/components/form-field-virtual-scroll/select-virtual-scroll/select-virtual-scroll.component';
import { SelectMultipleVirtualScrollComponent } from '@shared/components/form-field-virtual-scroll/select-multiple-virtual-scroll/select-multiple-virtual-scroll.component';
import {
  MultipleSelectCommonItem,
  MultipleSelectItem,
  SelectGroup,
} from '@shared/components/form-field-virtual-scroll/interfaces/select';

@Component({
  selector: 'app-poll-filters',
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatIconModule,
    CommonModule,
    SelectMultipleVirtualScrollComponent,
  ],
  providers: [DatePipe],
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

  cohorts = signal<CohortModel[]>([]);
  componentNames = signal<string[]>([]);
  evaluations: EvaluationModel[] | null = [];
  polls: PollModel[] = [];
  prevCohortIds: number[] = [];
  prevComponentSelections: string[] = [];
  prevVariablesSelections: number[] = [];
  variableGroups: VariableModel[][] = [];
  variables = signal<VariableModel[]>([]);
  variablesClone: VariableModel[] = [];
  variableSelectGroups = signal<SelectGroup[]>([]);

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

  readonly cohortsToScroll = computed<MultipleSelectCommonItem[]>(() => {
    const cohorts = this.cohorts();

    return cohorts
      ? cohorts.map(cohort => {
          return { label: cohort.name, value: cohort.id };
        })
      : [];
  });

  readonly componentsToScroll = computed<MultipleSelectItem[]>(() => {
    const componentNames = this.componentNames();
    return componentNames
      ? componentNames.map(componentName => {
          return { label: componentName, value: componentName };
        })
      : [];
  });

  readonly variablesGroupsToScroll = computed<MultipleSelectItem[]>(() => {
    const variables = this.variables();

    return variables
      ? variables.map(variable => {
          return { label: variable.name, value: variable.pollVariableId };
        })
      : [];
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
      this.variables.set([]);
      this._sendFilters();
      return;
    }

    this.variableGroups =
      this.filterForm.value.componentNames
        ?.filter(c => !!c)
        .map(c =>
          this.variablesClone.filter(v => !!v && v.componentName === c)
        ) || [];
    const variableGroupsFlat = this.variableGroups.flat();
    this.variables.set(variableGroupsFlat);
    this.filterForm.controls.variables.setValue(
      variableGroupsFlat.map(v => !!v && v.pollVariableId)
    );
    const result = this.variableGroups.flatMap(variableGroup => [
      {
        label: variableGroup[0].componentName.toLocaleUpperCase(),
        items: [
          ...variableGroup.map(g => ({
            label: g.name,
            value: g.pollVariableId,
          })),
        ],
      },
    ]);
    this.variableSelectGroups.set(result);
    this.prevVariablesSelections = this.variables().map(v => v.pollVariableId);
    this._sendFilters();
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
          cohortId =>
            this.cohorts().find(cohort => cohort.id === cohortId)?.name
        );
  }

  getComponentsSelection() {
    const componentNames = this.filterForm.value.componentNames?.filter(
      componentName => !!componentName
    );

    return componentNames?.length === this.componentNames.length
      ? ['Select all']
      : componentNames?.map(componentName =>
          this.componentNames().find(cN => cN === componentName)
        );
  }

  getAllVariableIds() {
    return this.variables().map(variable => variable.pollVariableId);
  }

  getVariablesSelection() {
    const variables = this.filterForm.value.variables?.filter(
      variable => !!variable
    );

    return variables?.length === this.variables.length
      ? ['Select all']
      : variables?.map(
          id => this.variables().find(v => v.pollVariableId === id)?.name
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
    this.cohorts.set([]);
    this.variables.set([]);
    this._resetField('cohortIds');
    this._resetField('variables');
    this.cohortsService.getCohorts(pollUuid).subscribe({
      next: response => {
        this.cohorts.set(response.body);
        this.filterForm.controls.cohortIds.setValue(
          response.body.map(cohort => cohort.id)
        );
        this.prevCohortIds = this.filterForm.value.cohortIds || [];
        this._getVariables();
      },
      error: () => this.cohorts.set([]),
    });
  }

  private _getVariables() {
    if (!this.polls[0]?.uuid) return;
    const componentNames = this.componentNames();

    this.pollsService
      .getVariablesByComponents(this.polls[0].uuid, [...componentNames], true)
      .subscribe({
        next: variables => {
          const newComponentNames = [
            ...new Set(variables.map(v => v.componentName)),
          ];
          this.variables.set(variables);
          this.variablesClone = [...variables];
          this.componentNames.set(newComponentNames);

          this.variableGroups = newComponentNames.map(c =>
            variables.filter(v => v.componentName === c)
          );
          const groups = this.variableGroups.flatMap(variableGroup => [
            {
              label: variableGroup[0].componentName.toLocaleUpperCase(),
              items: variableGroup.map(g => ({
                label: g.name,
                value: g.pollVariableId,
              })),
            },
          ]);
          this.variableSelectGroups.set(groups);
          this.filterForm.controls.variables.setValue(
            variables.map(v => v.pollVariableId)
          );
          this.prevVariablesSelections = this.filterForm.value.variables || [];
          this._sendFilters();
        },
      });
  }

  private _resetField(controlName: string) {
    this.filterForm.get(controlName)!.reset();
  }

  private _sendFilters() {
    if (!this.polls) return;
    const poll = this.polls.find(p => p.uuid === this.polls[0]?.uuid);
    const cohorts = this.filterForm.value.cohortIds || [];
    const cohortNames = cohorts.map(
      cohortId => this.cohorts().find(c => c.id == cohortId)?.name
    );
    const title = `Poll: ${poll?.name} - Cohort(s): ${cohortNames}`;
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
