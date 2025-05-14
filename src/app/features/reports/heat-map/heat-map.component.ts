import {
  Component,
  ElementRef,
  inject,
  OnInit,
  ViewChild,
} from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NgApexchartsModule } from 'ng-apexcharts';
import { CohortModel } from '../../../core/models/cohort.model';
import { PollModel } from '../../../core/models/poll.model';
import { PdfService } from '../../../core/services/exports/pdf.service';
import { Variable } from '../../../core/services/interfaces/variable.interface';
import {
  Components,
  ComponentValueType,
} from '../../heat-map/types/risk-students-detail.type';
import { ChartOptionsColorsCount } from '../constants/heat-map';
import { fillDefaultData } from './util/heat-map.util';
import { EmptyDataComponent } from '../../../shared/components/empty-data/empty-data.component';
import { CohortService } from '../../../core/services/api/cohort.service';
import { PollService } from '../../../core/services/api/poll.service';
import { HeatMapService } from '../../../core/services/api/heat-map.service';

@Component({
  selector: 'app-heat-map',
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule,
    NgApexchartsModule,
    MatButtonModule,
    MatIconModule,
    EmptyDataComponent,
  ],
  templateUrl: './heat-map.component.html',
  styleUrl: './heat-map.component.css',
})
export class HeatMapComponent implements OnInit {
  cohortService = inject(CohortService);
  pollsService = inject(PollService);
  pdfService = inject(PdfService);
  heatmapService = inject(HeatMapService);

  cohorts: CohortModel[] = [];
  polls: PollModel[] = [];
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

  chartOption = { ...ChartOptionsColorsCount };

  public isGeneratingPDF = false;

  @ViewChild('mainContainer', { static: false }) mainContainer!: ElementRef;

  constructor(private snackBar: MatSnackBar) {}

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

    this.selectForm.controls.component.valueChanges.subscribe(value => {
      const pollUuid = this.selectForm.value.pollUuid;
      if (value && pollUuid) {
        this.getQuestions(pollUuid, value);
      }
    });

    this.selectForm.valueChanges.subscribe(value => {
      if (value.pollUuid && value.question) {
        this.generateHeatMap(value.pollUuid!, value.question!);
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
      this.getQuestions(pollField!.value!, componentField!.value!);
    } else {
      questionField?.disable({ emitEvent: false });
    }
  }

  getCohorts() {
    this.cohortService.getCohorts().subscribe(data => {
      this.cohorts = data.body;
    });
  }

  getPollsByCohortId(id: number) {
    this.pollsService.getPollsByCohortId(id).subscribe(data => {
      this.polls = data;
    });
  }

  getQuestions(pollUuid: string, components: string[]) {
    this.pollsService
      .getVariablesByComponents(pollUuid, components)
      .subscribe(data => {
        this.questions = data;
        //NOTE: set deafult value for questions
        const variableIds = data.map(v => v.id);
        this.selectForm
          .get('question')!
          .setValue(variableIds, { emitEvent: false });
        this.generateHeatMap(this.selectForm.value.pollUuid!, variableIds);
      });
  }

  generateHeatMap(pollInstanceUuid: string, variablesIds: number[]) {
    this.heatmapService
      .generateHeatmap(pollInstanceUuid, variablesIds)
      .subscribe(data => {
        const heatmap = fillDefaultData([...data]);

        const serie = heatmap.map(d => ({
          data: d.data.sort((a, b) => a.y - b.y),
          name: d.name,
        }));

        this.chartOption.series = serie;
      });
  }

  printReportInfo() {
    if (this.isGeneratingPDF) return;
    this.isGeneratingPDF = true;
    const snackBarRef = this.snackBar.open('Generating PDF...', 'Close', {
      duration: 10000,
      panelClass: ['custom-snackbar'],
    });

    setTimeout(() => {
      const mainContainerElement = this.mainContainer.nativeElement;
      const clonedElement = mainContainerElement.cloneNode(true) as HTMLElement;
      clonedElement.style.width = '1440px';
      clonedElement.style.margin = 'auto';

      const swiperContainer = clonedElement.querySelector('#swiper-container');
      if (swiperContainer) {
        swiperContainer.removeAttribute('effect');
      }

      clonedElement.style.fontSize = '1.2em';

      const h2Elements = clonedElement.querySelectorAll('h2');
      h2Elements.forEach(h2 => (h2.style.fontSize = '1.6em'));

      const h3Elements = clonedElement.querySelectorAll('h3');
      h3Elements.forEach(h3 => (h3.style.fontSize = '1.4em'));

      const h4Elements = clonedElement.querySelectorAll('h4');
      h4Elements.forEach(h4 => (h4.style.fontSize = '1.2em'));

      const pElements = clonedElement.querySelectorAll('p');
      pElements.forEach(p => (p.style.fontSize = '1.2em'));

      clonedElement.querySelector('#print-button')?.remove();
      clonedElement.querySelector('.form-container')?.remove();
      clonedElement.querySelector('.filter-container')?.remove();
      clonedElement.querySelector('.title-card')?.remove();

      const containerCardList = clonedElement.querySelector(
        '.container-card-list'
      ) as HTMLElement;
      if (containerCardList) {
        Object.assign(containerCardList.style, {
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          width: '100%',
        });
      }

      const chartContainer = clonedElement.querySelector(
        '.chart-container'
      ) as HTMLElement;
      if (chartContainer) {
        Object.assign(chartContainer.style, {
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          width: '100%',
          margin: '0 auto',
          maxWidth: 'none',
        });
      }

      document.body.appendChild(clonedElement);

      this.pdfService.exportToPDF(clonedElement, `report-detail.pdf`);

      setTimeout(() => {
        snackBarRef.dismiss();

        this.snackBar.open('PDF generated successfully', 'OK', {
          duration: 3000,
          panelClass: ['custom-snackbar'],
        });
        this.isGeneratingPDF = false;
        document.body.removeChild(clonedElement);
      }, 2000);
    }, 10000);
  }
}
