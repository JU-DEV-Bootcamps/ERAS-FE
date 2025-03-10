import {
  Component,
  ElementRef,
  inject,
  OnInit,
  ViewChild,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { NgApexchartsModule } from 'ng-apexcharts';
import { ApexOptions } from 'ng-apexcharts';
import { MatDividerModule } from '@angular/material/divider';
import { MatCardModule } from '@angular/material/card';
import { StudentService } from '../../core/services/student.service';
import { StudentDetails } from '../../shared/models/student/studentDetails.model';
import { PdfExportService } from '../../core/services/pdf-export.service';

@Component({
  selector: 'app-student-detail',
  imports: [
    NgApexchartsModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatCardModule,
  ],
  templateUrl: './student-detail.component.html',
  styleUrl: './student-detail.component.scss',
})
export class StudentDetailComponent implements OnInit {
  @ViewChild('mainContainer', { static: false }) mainContainer!: ElementRef;
  studentDetails: StudentDetails = {} as StudentDetails;
  studentService = inject(StudentService);
  exportPrintService = inject(PdfExportService);

  public chartOptions: ApexOptions = {
    chart: {
      type: 'bar',
      height: 200,
    },
    plotOptions: {
      bar: {
        horizontal: true,
      },
    },
    series: [
      {
        data: [
          {
            x: 'Socioeconómico',
            y: 10,
            fillColor: '#E68787',
          },
          {
            x: 'Individual',
            y: 18,
            fillColor: '#E8B079',
          },
          {
            x: 'Academico',
            y: 13,
            fillColor: '#E5E880',
          },
          {
            x: 'Familiar',
            y: 13,
            fillColor: '#DFF8E3',
          },
        ],
      },
    ],
  };

  public risk_by_month_chart: ApexOptions = {
    series: [],
    chart: {
      type: 'heatmap',
      toolbar: {
        show: true,
        tools: {
          download:
            '<span class="material-icons" style="font-size: 40px; color: var(--primary-color);">download_for_offline</span>',
        },
      },
    },
    title: {
      text: '',
    },
    xaxis: {
      categories: [''],
    },
    plotOptions: {
      heatmap: {
        distributed: false,
        colorScale: {
          inverse: false,
          ranges: [
            {
              from: -1,
              to: 0,
              color: '#FFFFFF',
              foreColor: '#FFFFFF',
              name: 'No answer',
            },
            {
              from: 0,
              to: 2,
              color: '#008000',
              foreColor: '#FFFFFF',
              name: 'Low Risk',
            },
            {
              from: 2,
              to: 4,
              color: '#3CB371',
              foreColor: '#FFFFFF',
              name: 'Low-Medium Risk',
            },
            {
              from: 4,
              to: 6,
              color: '#F0D722',
              foreColor: '#FFFFFF',
              name: 'Medium Risk',
            },
            {
              from: 6,
              to: 8,
              color: '#FFA500',
              foreColor: '#FFFFFF',
              name: 'Medium-High Risk',
            },
            {
              from: 8,
              to: 100,
              color: '#FF0000',
              foreColor: '#FFFFFF',
              name: 'High Risk',
            },
          ],
        },
      },
    },
    tooltip: {
      y: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        formatter: function (val: number, opts?: any): string {
          const rowIdx = opts.seriesIndex;
          const colIdx = opts.dataPointIndex;
          const grid = opts.series;

          if (grid[rowIdx][colIdx] === -1) {
            return '';
          }
          return val.toString();
        },
        title: {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          formatter: function (seriesName: string, opts?: any): string {
            const rowIdx = opts.seriesIndex;
            const colIdx = opts.dataPointIndex;
            const grid = opts.series;

            if (grid[rowIdx][colIdx] === -1) {
              return '';
            }
            return seriesName;
          },
        },
      },
    },
  };

  ngOnInit(): void {
    this.getStudentDetails('2');
  }

  getStudentDetails(studentId: string) {
    this.studentService.getStudentDetailsById(studentId).subscribe({
      next: (data: StudentDetails) => {
        this.studentDetails = data;
      },
      error: error => {
        console.log(error);
      },
    });
  }

  printStudentInfo() {
    const mainContainerElement = this.mainContainer.nativeElement;

    const clonedElement = mainContainerElement.cloneNode(true) as HTMLElement;
    clonedElement.style.width = '1440px';
    clonedElement.style.margin = 'auto';
    clonedElement
      .querySelector('#chart-student-detail')
      ?.classList.add('print-chart');

    const h1 = document.createElement('h1');
    h1.textContent = 'Student Details';
    h1.style.textAlign = 'center';
    h1.style.fontSize = '2em';
    h1.style.fontWeight = '500';
    clonedElement.insertBefore(h1, clonedElement.firstChild);

    clonedElement.style.fontSize = '1.2em';

    const h2Elements = clonedElement.querySelectorAll('h2');
    h2Elements.forEach(h2 => {
      h2.style.fontSize = '1.6em';
    });

    const h3Elements = clonedElement.querySelectorAll('h3');
    h3Elements.forEach(h3 => {
      h3.style.fontSize = '1.4em';
    });

    const h4Elements = clonedElement.querySelectorAll('h4');
    h4Elements.forEach(h4 => {
      h4.style.fontSize = '1.2em';
    });

    const pElements = clonedElement.querySelectorAll('p');
    pElements.forEach(p => {
      p.style.fontSize = '1.2em';
    });

    const printButton = clonedElement.querySelector('#print-button');
    printButton?.remove();

    document.body.appendChild(clonedElement);
    this.exportPrintService.generatePDF(clonedElement, `student-detail-2.pdf`);
    document.body.removeChild(clonedElement);
  }
}
