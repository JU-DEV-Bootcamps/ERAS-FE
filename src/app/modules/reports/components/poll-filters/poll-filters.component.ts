import {
  Component,
  DestroyRef,
  Input,
  OnInit,
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
import { MatSelectChange, MatSelectModule } from '@angular/material/select';

import { CohortModel } from '@core/models/cohort.model';
import { PollModel } from '@core/models/poll.model';
import { VariableModel } from '@core/models/variable.model';

import { areArraysEqual } from '@core/utils/helpers/are-arrays-equal';
import { SelectAllDirective } from '@shared/directives/select-all.directive';

import { CohortService } from '@core/services/api/cohort.service';
import { PollService } from '@core/services/api/poll.service';
import { SelectedItemsComponent } from './selected-items/selected-items.component';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

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

  private cohortsService = inject(CohortService);
  private destroyRef = inject(DestroyRef);
  private pollsService = inject(PollService);

  cohorts: CohortModel[] = [];
  componentNames: string[] = [];
  polls: PollModel[] | null = [];
  prevCohortIds: number[] = [];
  prevComponentSelections: string[] = [];
  prevVariablesSelections: number[] = [];
  variableGroups: VariableModel[][] = [];
  variables: VariableModel[] = [];
  variablesClone: VariableModel[] = [];

  filters = output<{
    title: string;
    uuid: string;
    cohortIds: number[];
    variableIds: number[];
    lastVersion: boolean;
  }>();

  filterForm = new FormGroup({
    selectedPoll: new FormControl<PollModel | null>(null, [
      Validators.required,
    ]),
    lastVersion: new FormControl<boolean>(true, [Validators.required]),
    cohortIds: new FormControl<number[] | null>([], null),
    componentNames: new FormControl<string[] | null>(null, [
      Validators.required,
    ]),
    variables: new FormControl<number[] | null>(null, [Validators.required]),
  });

  ngOnInit() {
    this._loadPolls();
  }

  handlePollSelect(itemSelected: MatSelectChange) {
    const newSelectedPoll = itemSelected.value;
    const lastVersion = !!this.filterForm.value.lastVersion;
    this._getCohorts(newSelectedPoll.uuid, lastVersion);
  }

  handleVersionSelect(itemSelected: MatSelectChange) {
    const newSelectedPoll = this.filterForm.value.selectedPoll;
    const lastVersion = itemSelected.value;
    this._getCohorts(newSelectedPoll!.uuid, lastVersion);
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

  private _loadPolls() {
    this.pollsService
      .getAllPolls()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: polls => {
          this.polls = polls;
        },
        error: () => (this.polls = null),
      });
  }

  private _getCohorts(pollUuid: string, lastVersion: boolean) {
    this.cohorts = [];
    this.cohortsService
      .getCohorts(pollUuid, lastVersion)
      .subscribe(response => {
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
    if (!this.filterForm.value.selectedPoll?.uuid) return;
    this.componentNames = [];
    this.variables = [];
    this._resetField('variables');

    this.pollsService
      .getVariablesByComponents(
        this.filterForm.value.selectedPoll.uuid,
        [...this.componentNames],
        !!this.filterForm.value.lastVersion
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
    const poll = this.polls.find(
      p => p.uuid === this.filterForm.value.selectedPoll?.uuid
    );
    const cohorts = this.filterForm.value.cohortIds || [];
    const title = `Poll: ${poll?.name} V${poll?.lastVersion} - Cohort(s): ${cohorts.map(cohortId => this.cohorts.find(c => c.id == cohortId)?.name)}`;
    const uuid = this.filterForm.value.selectedPoll?.uuid || '';
    const cohortIds = this.filterForm.value.cohortIds!.filter(Boolean);
    const variableIds = this.filterForm.value.variables || [];
    const lastVersion = this.filterForm.value.lastVersion!;

    this.filters.emit({ title, uuid, cohortIds, variableIds, lastVersion });
  }
}
