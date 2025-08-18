import { Component, Input, OnInit, inject, output } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { PollService } from '../../../../core/services/api/poll.service';
import { CohortService } from '../../../../core/services/api/cohort.service';
import { PollModel } from '../../../../core/models/poll.model';
import { CohortModel } from '../../../../core/models/cohort.model';
import { VariableModel } from '../../../../core/models/variable.model';
import { CommonModule } from '@angular/common';
import { SelectAllDirective } from '../../../../shared/directives/select-all.directive';
import { MatProgressSpinner } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-poll-filters',
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatIconModule,
    CommonModule,
    SelectAllDirective,
    MatProgressSpinner,
  ],
  templateUrl: './poll-filters.component.html',
  styleUrl: './poll-filters.component.css',
})
export class PollFiltersComponent implements OnInit {
  @Input() showVariables = true;

  pollsService = inject(PollService);
  cohortsService = inject(CohortService);
  polls: PollModel[] | null = [];
  cohorts: CohortModel[] = [];
  componentNames: string[] = [];
  variables: VariableModel[] = [];
  variableGroups: VariableModel[][] = [];

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

  ngOnInit(): void {
    this.pollsService.getAllPolls().subscribe({
      next: response => (this.polls = response),
      error: () => (this.polls = null),
    });
  }

  handlePollSelect(isOpen: boolean) {
    const newSelectedPoll = this.filterForm.value.selectedPoll;

    if (isOpen) return;
    if (newSelectedPoll) {
      this.cohortsService
        .getCohorts(newSelectedPoll.uuid, !!this.filterForm.value.lastVersion)
        .subscribe(response => {
          this.cohorts = response.body;
          this.filterForm.controls.cohortIds.setValue(
            this.cohorts.map(cohort => cohort.id)
          );
          this.handleCohortSelect(false);
        });
    } else {
      console.warn('selectedPoll is null');
    }
  }
  handleCohortSelect(isOpen: boolean) {
    if (isOpen) return;
    if (!this.filterForm.value.selectedPoll?.uuid) return;
    if (!this.filterForm.value.cohortIds?.length) {
      this.sendFilters();
      return;
    }
    this.pollsService
      .getVariablesByComponents(
        this.filterForm.value.selectedPoll?.uuid,
        [...this.componentNames],
        !!this.filterForm.value.lastVersion
      )
      .subscribe(variables => {
        this.variables = variables;
        this.componentNames = [...new Set(variables.map(v => v.componentName))];
        this.variableGroups = this.componentNames.map(c =>
          variables.filter(v => v.componentName === c)
        );
        this.filterForm.controls.componentNames.setValue(this.componentNames);
        this.filterForm.controls.variables.setValue(
          this.variables.map(v => v.pollVariableId)
        );
        this.sendFilters();
      });
  }

  handleVersionSelect(isOpen: boolean) {
    if (isOpen) return;
    this.handleCohortSelect(false);
  }

  handleUpdateComponents(isOpen: boolean) {
    if (isOpen) return;
    if (this.filterForm.value.selectedPoll?.uuid === null) return;
    if (this.filterForm.value.componentNames!.length === 0) {
      this.variableGroups = [];
      this.resetField('variables');
      this.sendFilters();
      return;
    }
    this.variableGroups =
      this.filterForm.value.componentNames?.map(c =>
        this.variables.filter(v => v.componentName === c)
      ) || [];
    this.filterForm.controls.variables.setValue(
      this.variableGroups.flat().map(v => v.id)
    );
    this.sendFilters();
  }

  handleVariableSelect(isOpen: boolean) {
    if (isOpen) return;
    if (!this.filterForm.value.variables?.length) {
      this.resetField('variables');
    }

    this.sendFilters();
  }

  sendFilters() {
    if (!this.polls) return;
    const poll = this.polls.find(
      p => p.uuid === this.filterForm.value.selectedPoll?.uuid
    );
    const cohorts = this.filterForm.value.cohortIds || [];
    const title = `Poll: ${poll?.name} V${poll?.lastVersion} - Cohort(s): ${cohorts.map(cohortId => this.cohorts.find(c => c.id == cohortId)?.name)}`;
    const uuid = this.filterForm.value.selectedPoll?.uuid || '';
    const cohortIds = this.filterForm.value.cohortIds!;
    const variableIds = this.filterForm.value.variables!;
    const lastVersion = this.filterForm.value.lastVersion!;
    this.filters.emit({ title, uuid, cohortIds, variableIds, lastVersion });
  }

  private resetField(controlName: string) {
    this.filterForm.get(controlName)!.reset();
  }

  getCohortsDisplay() {
    const cohortIds = this.filterForm.value.cohortIds?.filter(
      cohortId => !!cohortId
    );

    return cohortIds?.length === this.cohorts.length
      ? 'Select all'
      : cohortIds
          ?.map(
            cohortId =>
              this.cohorts.find(cohort => cohort.id === cohortId)?.name
          )
          ?.join(', ');
  }

  getComponentsDisplay() {
    const componentNames = this.filterForm.value.componentNames?.filter(
      componentName => !!componentName
    );

    return componentNames?.length === this.componentNames.length
      ? 'Select all'
      : componentNames
          ?.map(componentName =>
            this.componentNames.find(cN => cN === componentName)
          )
          ?.join(', ');
  }

  getVariablesDisplay() {
    const variables = this.filterForm.value.variables?.filter(
      variable => !!variable
    );

    return variables?.length === this.variables.length
      ? 'Select all'
      : variables
          ?.map(id => this.variables.find(v => v.id === id)?.name)
          ?.join(', ');
  }
}
