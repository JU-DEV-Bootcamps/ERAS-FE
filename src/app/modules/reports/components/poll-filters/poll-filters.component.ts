import {
  Component,
  DestroyRef,
  Input,
  OnInit,
  computed,
  inject,
  output,
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
import { MatSelectChange, MatSelectModule } from '@angular/material/select';

import { CohortModel } from '@core/models/cohort.model';
import { PollModel } from '@core/models/poll.model';
import { VariableModel } from '@core/models/variable.model';

import { areArraysEqual } from '@core/utils/helpers/are-arrays-equal';

import { CohortService } from '@core/services/api/cohort.service';
import { PollService } from '@core/services/api/poll.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { SelectVirtualScrollComponent } from '@shared/components/form-field-virtual-scroll/select-virtual-scroll/select-virtual-scroll.component';
import { SelectMultipleVirtualScrollComponent } from '@shared/components/form-field-virtual-scroll/select-multiple-virtual-scroll/select-multiple-virtual-scroll.component';
import {
  SingleSelectItem,
  MultipleSelectItem,
  SelectGroup,
  MultipleSelectCommonItem,
} from '@shared/components/form-field-virtual-scroll/interfaces/select';

@Component({
  selector: 'app-poll-filters',
  imports: [
    SelectVirtualScrollComponent,
    SelectMultipleVirtualScrollComponent,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatIconModule,
    CommonModule,
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
  private datePipe = inject(DatePipe);

  cohorts = signal<CohortModel[]>([]);
  componentNames = signal<string[]>([]);
  polls = signal<PollModel[] | null>([]);
  variableSelectGroups = signal<SelectGroup[]>([]);
  prevCohortIds: number[] = [];
  prevVariablesSelections: number[] = [];
  variableGroups: VariableModel[][] = [];
  variables = signal<VariableModel[]>([]);
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

  readonly pollsToScroll = computed<SingleSelectItem[]>(() => {
    const polls = this.polls();

    return polls
      ? polls.map(poll => {
          return { label: poll.name, value: poll };
        })
      : [];
  });

  readonly pollVersionsToScroll = computed<SingleSelectItem[]>(() => {
    if (!this.filterForm.value || !this.filterForm.value.selectedPoll) {
      return [];
    }

    const dateFormatted = this.datePipe.transform(
      this.filterForm.value.selectedPoll.lastVersionDate,
      'shortDate'
    );

    return [
      { label: 'Older Versions', value: false },
      {
        label: `Last Version V${this.filterForm.value.selectedPoll.lastVersion} - ${dateFormatted}`,
        value: true,
      },
    ];
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
          return { label: variable.name, value: variable.id };
        })
      : [];
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

    if (!this.filterForm.value.componentNames?.length) {
      this.variableGroups = [];
      this.variableSelectGroups.set([]);
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

  getAllVariableIds() {
    return this.variables().map(variable => variable.pollVariableId);
  }

  private _loadPolls() {
    this.pollsService
      .getAllPolls()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: polls => this.polls.set(polls),
        error: () => this.polls.set(null),
      });
  }

  private _getCohorts(pollUuid: string, lastVersion: boolean) {
    this.cohorts.set([]);
    this.variables.set([]);
    this._resetField('cohortIds');
    this._resetField('variables');
    this.cohortsService.getCohorts(pollUuid, lastVersion).subscribe({
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
    if (!this.filterForm.value.selectedPoll?.uuid) return;

    const componentNames = this.componentNames();

    this.pollsService
      .getVariablesByComponents(
        this.filterForm.value.selectedPoll.uuid,
        [...componentNames],
        true
      )
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
    const polls = this.polls();
    if (!polls) return;
    const poll = polls.find(
      p => p.uuid === this.filterForm.value.selectedPoll?.uuid
    );
    const cohorts = this.filterForm.value.cohortIds || [];
    const cohortNames = cohorts.map(
      cohortId => this.cohorts().find(c => c.id == cohortId)?.name
    );
    const title = `Poll: ${poll?.name} V${poll?.lastVersion} - Cohort(s): ${cohortNames}`;
    const uuid = this.filterForm.value.selectedPoll?.uuid || '';
    const cohortIds = this.filterForm.value.cohortIds!.filter(Boolean);
    const variableIds = this.filterForm.value.variables || [];
    const lastVersion = this.filterForm.value.lastVersion!;

    this.filters.emit({ title, uuid, cohortIds, variableIds, lastVersion });
  }
}
