import { Component, inject, OnInit } from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';

import { RiskStudentsTableComponent } from '../../shared/components/risk-students-table/risk-students-table.component';
import { PollService } from '../../core/services/poll.service';
import { Poll } from '../list-students-by-poll/types/list-students-by-poll';
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
  public variableIds: number[] = [1];
  public form: FormGroup;

  private pollService = inject(PollService);

  pollsData: Poll[] = [];
  selectedPoll = this.pollsData[0];

  constructor() {
    this.form = new FormGroup({
      pollUuid: new FormControl(''),
    });
  }

  ngOnInit(): void {
    //let isFirstFetch = true;

    this.loadPollsList();
    this.form.valueChanges.subscribe(formValue => {
      this.selectedPoll = this.pollsData.filter(
        poll => poll.uuid == formValue.pollUuid
      )[0];
    });
  }

  loadPollsList(): void {
    this.pollService.getAllPolls().subscribe(data => {
      this.pollsData = data;
      console.log(data);
      this.form.get('pollUuid')?.setValue(data[0].uuid);
    });
  }
}
