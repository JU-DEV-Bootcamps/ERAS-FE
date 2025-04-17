import { Component, inject, OnInit } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { Poll } from '../../../core/services/Types/poll.type';
import { MatSelectModule } from '@angular/material/select';
import { PollService } from '../../../core/services/poll.service';
import { StudentService } from '../../../core/services/student.service';
import { CohortService } from '../../../core/services/cohort.service';
import { PdfService } from '../../../core/services/report/pdf.service';
import { HeatMapService } from '../services/heat-map.service';
import { Cohort } from '../../../core/services/Types/cohort.type';
import {
  Components,
  ComponentValueType,
} from '../../heat-map/types/risk-students-detail.type';
import { VariableService } from '../../../core/services/variable/variable.service';
import { Variable } from '../../../core/services/variable/interface/variable.interface';

@Component({
  selector: 'app-heat-map',
  imports: [ReactiveFormsModule, MatFormFieldModule, MatSelectModule],
  templateUrl: './heat-map.component.html',
  styleUrl: './heat-map.component.css',
})
export class HeatMapComponent implements OnInit {
  studentService = inject(StudentService);
  cohortService = inject(CohortService);
  pollsService = inject(PollService);
  variableService = inject(VariableService);
  pdfService = inject(PdfService);
  heatmapService = inject(HeatMapService);

  cohorts: Cohort[] = [];
  polls: Poll[] = [];
  questions: Variable[] = [];

  components = [
    {
      name: 'Académico',
      value: Components.ACADEMIC,
    },
    {
      name: 'Individual',
      value: Components.INDIVIDUAL,
    },
    {
      name: 'Familiar',
      value: Components.FAMILIAR,
    },
    {
      name: 'Económico',
      value: Components.SOCIO_ECONOMIC,
    },
  ];

  selectForm = new FormGroup({
    cohortId: new FormControl<number | null>(null, [Validators.required]),
    pollUuid: new FormControl<string | null>({ value: null, disabled: true }, [
      Validators.required,
    ]),
    component: new FormControl<ComponentValueType[]>(
      { value: this.components.map(c => c.value), disabled: true },
      Validators.required
    ),
    question: new FormControl<number[]>({ value: [], disabled: true }, [
      Validators.required,
    ]),
  });

  ngOnInit() {
    this.getCohorts();
    this.selectForm.controls.cohortId.valueChanges.subscribe(value => {
      if (value) {
        this.getPollsByCohortId(value);
        this.toggleEnable();
      }
    });

    this.selectForm.controls.pollUuid.valueChanges.subscribe(value => {
      if (value) {
        this.toggleEnable();
      }
    });

    this.selectForm.valueChanges.subscribe(value => {
      //TODO: add request for heat-map
      console.log(value);
      if (value.pollUuid && value.component) {
        this.getQuestions(value.pollUuid, value.component);
        // this.getHeatMap();
      }
    });
  }

  toggleEnable() {
    const cohortValid = this.selectForm.get('cohortId')?.valid;
    const pollField = this.selectForm.get('pollUuid');
    const componentField = this.selectForm.get('component');
    const questionField = this.selectForm.get('question');

    if (cohortValid) {
      pollField?.enable({ emitEvent: false });
    } else {
      pollField?.disable({ emitEvent: false });
    }
    if (pollField?.valid) {
      componentField?.enable({ emitEvent: false });
    } else {
      componentField?.disable({ emitEvent: false });
    }
    if (componentField?.valid) {
      questionField?.enable({ emitEvent: false });
    } else {
      questionField?.disable({ emitEvent: false });
    }
  }

  getCohorts() {
    this.cohortService.getCohorts().subscribe(data => {
      this.cohorts = data;
    });
  }

  getPollsByCohortId(id: number) {
    this.pollsService.getPollsByCohortId(id).subscribe(data => {
      this.polls = data;
    });
  }

  getQuestions(pollUuid: string, components: string[]) {
    this.variableService
      .getVariablesByPollUuid(pollUuid, components)
      .subscribe(data => {
        this.questions = data;
        //NOTE: set deafult value for questions
        const variableIds = data.map(v => v.id);
        this.selectForm
          .get('question')!
          .setValue(variableIds, { emitEvent: false });
      });
  }
}
