import { Component, inject, OnInit } from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';

import { RiskStudentsTableComponent } from '../../shared/components/risk-students-table/risk-students-table.component';
import { Poll } from '../list-students-by-poll/types/list-students-by-poll';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import {
  MockUpAnswers,
  Question,
  SurveyKind,
} from '../reports/types/data.generator';
import { adaptAnswers } from '../reports/util/data.adapter';
import { PollService } from '../../core/services/api/poll.service';
import { HeatMapService } from '../../core/services/api/heat-map.service';
@Component({
  selector: 'app-risk-students',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    RiskStudentsTableComponent,
    MatSelectModule,
  ],
  templateUrl: './risk-students.component.html',
  styleUrl: './risk-students.component.css',
})
export class RiskStudentsComponent implements OnInit {
  public variableIds: number[] = [1, 2, 3, 4];
  public questions: Question[] = [] as Question[];
  public form: FormGroup;
  public mockupAnswers: MockUpAnswers = {
    ACADEMIC: null,
    INDIVIDUAL: null,
    FAMILIAR: null,
    SOCIAL: null,
  };
  public surveyKinds: SurveyKind[] = [
    'ACADEMIC',
    'INDIVIDUAL',
    'FAMILIAR',
    'SOCIAL',
  ];
  private defaultSurvey = this.surveyKinds;
  public surveyKind = this.defaultSurvey;
  public selectSurveyKinds = this.defaultSurvey;

  private pollService = inject(PollService);
  private heatMapService = inject(HeatMapService);

  pollsData: Poll[] = [];
  selectQuestions: string[] = [];
  selectedPoll = this.pollsData[0];

  constructor() {
    this.form = new FormGroup({
      selectQuestions: new FormControl(
        [],
        [Validators.required, this.selectQuestionsValidator]
      ),
      selectSurveyKinds: new FormControl(
        this.defaultSurvey,
        Validators.required
      ),
      pollUuid: new FormControl(''),
    });
  }

  ngOnInit(): void {
    let isFirstFetch = true;

    this.loadPollsList();
    this.form.valueChanges
      .pipe(debounceTime(500), distinctUntilChanged())
      .subscribe(formValue => {
        this.selectedPoll = this.pollsData.filter(
          poll => poll.uuid == formValue.pollUuid
        )[0];
        this.selectQuestions = formValue.selectQuestions;

        const pollUUID = formValue.pollUuid;
        const dataPoll = this.heatMapService.getDataPoll(pollUUID);

        dataPoll.subscribe(data => {
          const tempQuestions: Question[] = [];
          const tempVariableIds: number[] = [];

          this.mockupAnswers = adaptAnswers(data);
          this.selectSurveyKinds = this.form.get('selectSurveyKinds')?.value;
          this.surveyKinds.forEach(surveyKind => {
            const questions =
              this.mockupAnswers[surveyKind]!.questions.questions;

            questions.forEach(question => {
              if (
                isFirstFetch ||
                this.selectQuestions.includes(question.description)
              ) {
                tempQuestions.push(question);
                tempVariableIds.push(question.variableId);
              }
            });
          });
          this.questions = tempQuestions;
          this.variableIds = tempVariableIds;

          if (isFirstFetch || pollUUID !== this.form.get('pollUuid')?.value) {
            isFirstFetch = false;
            this.form
              .get('selectQuestions')
              ?.setValue(this.questions.map(q => q.description));
          }
        });
      });
  }

  loadPollsList(): void {
    this.pollService.getAllPolls().subscribe(data => {
      this.pollsData = data.items;
      this.form.get('pollUuid')?.setValue(data.items[0].uuid);
    });
  }

  selectQuestionsValidator(
    control: FormControl
  ): Record<string, boolean> | null {
    const value = control.value;

    if (value.length === 0) {
      return { invalidDomain: true };
    }

    return null;
  }
}
