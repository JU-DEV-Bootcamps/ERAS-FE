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
  }>();

  filterForm = new FormGroup({
    pollUuid: new FormControl<string | null>(null, [Validators.required]),
    cohortIds: new FormControl<number[] | null>(null, [Validators.required]),
    componentNames: new FormControl<string[] | null>(null, [
      Validators.required,
    ]),
    variables: new FormControl<number[] | null>(null, [Validators.required]),
  });

  ngOnInit(): void {
    this.pollsService.getAllPolls().subscribe({
      next: res => (this.polls = res),
      error: () => (this.polls = null),
    });
    this.filterForm.controls.pollUuid.valueChanges.subscribe(() => {
      this.cohortsService
        .getCohorts(this.filterForm.value.pollUuid)
        .subscribe(res => (this.cohorts = res.body));
    });
  }

  handleCohortSelect(isOpen: boolean) {
    console.info('handleCohortSelect');
    if (isOpen) return;
    if (!this.filterForm.value.pollUuid) return;
    this.pollsService
      .getVariablesByComponents(this.filterForm.value.pollUuid, [
        ...this.componentNames,
      ])
      .subscribe(variables => {
        this.variables = variables;
        this.componentNames = [...new Set(variables.map(v => v.componentName))];
        this.variableGroups = this.componentNames.map(c =>
          variables.filter(v => v.componentName === c)
        );
        this.filterForm.controls.componentNames.setValue(this.componentNames);
        this.filterForm.controls.variables.setValue(
          this.variables.map(v => v.id)
        );
        this.sendFilters();
      });
  }

  handleUpdateComponents(isOpen: boolean) {
    if (isOpen) return;
    if (
      this.filterForm.value.pollUuid === null ||
      this.filterForm.value.cohortIds === null
    )
      return;
    if (this.filterForm.value.componentNames!.length === 0) {
      this.variableGroups = [];
      return;
    }
    this.variableGroups =
      this.filterForm.value.componentNames?.map(c =>
        this.variables.filter(v => v.componentName === c)
      ) || [];
    this.sendFilters();
  }

  handleVariableSelect(isOpen: boolean) {
    if (!isOpen) this.sendFilters();
  }
  sendFilters() {
    if (!this.polls) return;
    const poll = this.polls.find(
      p => p.uuid === this.filterForm.value.pollUuid
    );
    const cohorts = this.filterForm.value.cohortIds || [];
    const title = `Poll: ${poll?.name} V${poll?.lastVersion} - Cohort(s): ${cohorts.map(cohortId => this.cohorts.find(c => c.id == cohortId)?.name)}`;
    const uuid = this.filterForm.value.pollUuid;
    const cohortIds = this.filterForm.value.cohortIds;
    const variableIds = this.filterForm.value.variables;
    if (!uuid || !cohortIds || !variableIds) return;
    this.filters.emit({ title, uuid, cohortIds, variableIds });
  }
}
