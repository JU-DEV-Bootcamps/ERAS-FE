import {
  Component,
  DestroyRef,
  Input,
  OnInit,
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
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';

import { CohortModel } from '@core/models/cohort.model';
import { PollModel } from '@core/models/poll.model';
import { VariableModel } from '@core/models/variable.model';
import { Filter } from '@modules/reports/components/poll-filters/types/filters';

import { areArraysEqual } from '@core/utils/helpers/are-arrays-equal';

import { CohortService } from '@core/services/api/cohort.service';
import { PollService } from '@core/services/api/poll.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { EvaluationsService } from '@core/services/api/evaluations.service';
import { EvaluationModel } from '@core/models/evaluation.model';
import { Pagination } from '@core/services/interfaces/server.type';
import { SelectVirtualScrollComponent } from '@shared/components/form-field-virtual-scroll/select-virtual-scroll/select-virtual-scroll.component';
import { SelectMultipleVirtualScrollComponent } from '@shared/components/form-field-virtual-scroll/select-multiple-virtual-scroll/select-multiple-virtual-scroll.component';
import {
  MultipleSelectCommonItem,
  MultipleSelectItem,
  SelectGroup,
  SingleSelectItem,
} from '@shared/components/form-field-virtual-scroll/interfaces/select';
import { switchMap } from 'rxjs';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';

@Component({
  selector: 'app-poll-filters',
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatIconModule,
    MatButtonModule,
    CommonModule,
    SelectMultipleVirtualScrollComponent,
    SelectVirtualScrollComponent,
  ],
  providers: [DatePipe],
  templateUrl: './poll-filters.component.html',
  styleUrl: './poll-filters.component.scss',
})
export class PollFiltersComponent implements OnInit {
  @Input() showVariables = true;

  private cohortsService = inject(CohortService);
  private destroyRef = inject(DestroyRef);
  private pollsService = inject(PollService);
  private evaluationsService = inject(EvaluationsService);

  cohorts = signal<CohortModel[]>([]);
  componentNames = signal<string[]>([]);
  allComponentNames = signal<string[]>([]);
  evaluations = signal<EvaluationModel[] | null>([]);
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

  filters = output<Filter>();

  filterForm = new FormGroup({
    selectedEvaluation: new FormControl<EvaluationModel | null>(null, [
      Validators.required,
    ]),
    cohortIds: new FormControl<number[] | null>([], [Validators.required]),
    componentNames: new FormControl<string[] | null>(null),
    variables: new FormControl<number[] | null>(null),
  });

  readonly evaluationsToScroll = computed<SingleSelectItem[]>(() => {
    return (this.evaluations() ?? []).map(e => ({
      label: `${e.name} - ${e.status}`,
      value: e,
    }));
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
    const componentNames = this.allComponentNames();
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
    this._setupDynamicValidators();
    this._disableSecondaryControls();
  }

  handleEvaluationSelect(itemSelected: MatAutocompleteSelectedEvent) {
    const newSelectedEvaluation: EvaluationModel = itemSelected.option.value;
    if (!newSelectedEvaluation) return;

    this.filterForm.patchValue({
      cohortIds: [],
      componentNames: [],
      variables: [],
    });

    this.componentNames.set([]);
    this.allComponentNames.set([]);
    this.variables.set([]);
    this.prevComponentSelections = [];
    this.prevCohortIds = [];
    this.prevVariablesSelections = [];

    this.filterForm.controls.cohortIds.enable();
    if (this.showVariables) {
      this.filterForm.controls.componentNames.disable();
      this.filterForm.controls.variables.disable();
    }

    this._getPolls(newSelectedEvaluation);
    if (this.polls?.length) {
      this._getCohorts(this.polls[0].uuid);
    }
  }

  handleCohortSelect(isOpen: boolean) {
    if (isOpen || !this.showVariables) return;
    const cohortIds = this.filterForm.value.cohortIds || [];
    if (areArraysEqual(this['prevCohortIds'], cohortIds)) return;
    this.prevCohortIds = [...cohortIds];
  }

  handleComponentsSelect(isOpen: boolean) {
    if (isOpen) return;
    if (this.filterForm.controls.componentNames.disabled) return;

    const componentNames = this.filterForm.value.componentNames || [];
    if (areArraysEqual(this.prevComponentSelections, componentNames)) return;
    this.prevComponentSelections = [...componentNames];

    if (!this.filterForm.value.componentNames?.length) {
      this.variableGroups = [];
      this._resetField('variables');
      this.filterForm.controls.variables.markAsTouched();
      this.filterForm.controls.variables.disable();
      this.variables.set([]);
      return;
    }

    this.filterForm.controls.variables.enable();

    this.variableGroups =
      this.filterForm.value.componentNames
        ?.filter(c => !!c)
        .map(c =>
          this.variablesClone.filter(v => !!v && v.componentName === c)
        ) || [];
    const variableGroupsFlat = this.variableGroups.flat();
    this.variables.set(variableGroupsFlat);

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

    setTimeout(() => {
      this.filterForm.controls.variables.setValue(
        variableGroupsFlat.map(v => !!v && v.pollVariableId)
      );
    });
  }

  handleVariableSelect(isOpen: boolean) {
    if (isOpen) return;
    const variables = this.filterForm.value.variables || [];
    if (areArraysEqual(this.prevVariablesSelections, variables)) return;
    this.prevVariablesSelections = [...variables];
  }

  onApply() {
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

    return variables?.length === this.variables.length &&
      this.componentNames?.length > 0
      ? ['Select all']
      : variables?.map(
          id => this.variables().find(v => v.pollVariableId === id)?.name
        );
  }

  private _loadEvaluations() {
    this.evaluationsService
      .getAllEvalProc(this.pagination)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        switchMap(({ count }) =>
          this.evaluationsService.getAllEvalProc({ page: 0, pageSize: count })
        )
      )
      .subscribe({
        next: result => {
          const completed = result.items.filter(e => e.status === 'Completed');
          this.evaluations.set(completed);
        },
        error: () => this.evaluations.set(null),
      });
  }

  private _getPolls(evaluation: EvaluationModel) {
    this.polls = evaluation.polls;
  }

  private _setupDynamicValidators() {
    if (this.showVariables) {
      this.filterForm.controls.componentNames.setValidators([
        Validators.required,
      ]);
      this.filterForm.controls.variables.setValidators([Validators.required]);
    } else {
      this.filterForm.controls.componentNames.clearValidators();
      this.filterForm.controls.variables.clearValidators();
    }
    this.filterForm.controls.componentNames.updateValueAndValidity();
    this.filterForm.controls.variables.updateValueAndValidity();
  }

  private _getCohorts(pollUuid: string) {
    this.cohorts.set([]);
    this.variables.set([]);
    this._resetField('cohortIds');
    this._resetField('variables');
    this.cohortsService.getCohorts(pollUuid).subscribe({
      next: response => {
        this.cohorts.set(response.body);
        const allIds = response.body.map(c => c.id);
        this.filterForm.controls.cohortIds.setValue(allIds);
        this.prevCohortIds = allIds;

        if (this.showVariables) {
          this._getVariables(undefined, true);
        }
      },
      error: () => this.cohorts.set([]),
    });
  }

  private _getVariables(filterNames?: string[], isInitialLoad = false) {
    if (!this.polls || !this.polls[0]?.uuid) return;
    const namesToQuery =
      filterNames ?? this.filterForm.value.componentNames ?? [];

    this.pollsService
      .getVariablesByComponents(this.polls[0].uuid, [...namesToQuery], true)
      .subscribe({
        next: variables => {
          if (!variables) return;
          this.variablesClone = variables;
          this.variables.set(variables);

          const newComponentNames = [
            ...new Set(variables.map(v => v.componentName).filter(Boolean)),
          ];

          if (isInitialLoad) {
            this.allComponentNames.set(newComponentNames);
            this.componentNames.set(newComponentNames);
            this.filterForm.controls.componentNames.setValue(newComponentNames);
            this.prevComponentSelections = [...newComponentNames];
          }

          if (filterNames) {
            this.filterForm.controls.componentNames.setValue(newComponentNames);
            this.prevComponentSelections = [...newComponentNames];
          }

          if (this.showVariables) {
            this.filterForm.controls.componentNames.enable();
            this.filterForm.controls.variables.enable();
          }

          const groups = newComponentNames.map(compName => ({
            label: compName.toUpperCase(),
            items: variables
              .filter(v => v.componentName === compName)
              .map(v => ({ label: v.name, value: v.pollVariableId })),
          }));

          this.variableSelectGroups.set(groups);
          const allVariableIds = variables.map(v => v.pollVariableId);
          this.prevVariablesSelections = allVariableIds;

          setTimeout(() => {
            this.filterForm.controls.variables.setValue(allVariableIds);
          });
        },
        error: () => {
          this.variables.set([]);
          this.variableSelectGroups.set([]);
        },
      });
  }

  private _resetField(controlName: string) {
    this.filterForm.get(controlName)!.reset();
  }

  private _sendFilters() {
    if (!this.polls[0]) return;

    const formVal = this.filterForm.value;
    const evaluationId = formVal.selectedEvaluation?.id;
    const cohorts = formVal.cohortIds || [];

    const cohortNames = cohorts
      .map(id => this.cohorts().find(c => c.id === id)?.name)
      .join(', ');

    const title = `Poll: ${this.polls[0].name} - Cohort(s): ${cohortNames}`;
    const selectedComponents = formVal.componentNames || [];

    this.filters.emit({
      title,
      uuid: this.polls[0].uuid,
      cohortIds: cohorts.filter((id): id is number => !!id),
      variableIds: this.showVariables ? formVal.variables || [] : [],
      lastVersion: true,
      evaluationId,
      selectedComponentIndex: selectedComponents
        .map(name =>
          name !== undefined
            ? this.variableSelectGroups().findIndex(
                g => g.label === name.toUpperCase()
              )
            : -1
        )
        .filter(i => i !== -1),
      selectedComponents,
    });
  }

  private _disableSecondaryControls() {
    this.filterForm.controls.cohortIds.disable();
    if (this.showVariables) {
      this.filterForm.controls.componentNames.disable();
      this.filterForm.controls.variables.disable();
    }
  }
}
