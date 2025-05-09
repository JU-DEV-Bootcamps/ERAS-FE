import { Component, OnInit, inject } from '@angular/core';
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
import { ComponentModel } from '../../../../core/models/component.model';
import { VariableModel } from '../../../../core/models/variable.model';

@Component({
  selector: 'app-poll-filters',
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatIconModule,
  ],
  templateUrl: './poll-filters.component.html',
  styleUrl: './poll-filters.component.css',
})
export class PollFiltersComponent implements OnInit {
  pollsService = inject(PollService);
  cohortsService = inject(CohortService);
  polls: PollModel[] = [];
  cohorts: CohortModel[] = [];
  components: ComponentModel[] = [];
  variables: VariableModel[] = [];

  filterForm = new FormGroup({
    pollUuid: new FormControl<string | null>(null, [Validators.required]),
    cohortId: new FormControl<number | null>(0, [Validators.required]),
    component: new FormControl<string | null>(
      { value: 'All', disabled: true },
      [Validators.required]
    ),
    question: new FormControl<number[]>({ value: [], disabled: true }, [
      Validators.required,
    ]),
  });
  selectedPoll: PollModel | undefined;

  ngOnInit(): void {
    this.pollsService.getAllPolls().subscribe(res => {
      this.polls = res;
    });
    //TODO: Filter cohorts by poll? how to relate a poll with a cohort
    this.cohortsService.getCohorts().subscribe(res => (this.cohorts = res));
  }
  handlePollSelect() {
    this.selectedPoll = this.polls.find(
      p => p.uuid == this.filterForm.value.pollUuid
    );
    if (!this.selectedPoll) return;
    this.components = this.selectedPoll.components;
    this.pollsService
      .getVariablesByComponents(
        this.selectedPoll.uuid,
        this.components.map(c => c.name)
      )
      .subscribe(variables => (this.variables = variables));
    return '';
  }
}
