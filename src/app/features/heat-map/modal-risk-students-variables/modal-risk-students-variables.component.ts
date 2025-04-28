import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatMenuModule } from '@angular/material/menu';
import {
  MatDialogModule,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import {
  ComponentData,
  DialogRiskVariableData,
  MappedData,
  Variable,
} from '../types/risk-students-variables.type';
import { ReportService } from '../../../core/services/report.service.ts.service';

interface SelectedHMData {
  cohortId: string;
  pollUuid: string;
  selectedVariableDetails: { x: string; y: string; z: string };
}

@Component({
  selector: 'app-modal-risk-students-variables',
  imports: [
    MatDialogModule,
    MatButtonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
    MatCardModule,
    MatTableModule,
    MatMenuModule,
  ],
  templateUrl: './modal-risk-students-variables.component.html',
  styleUrl: './modal-risk-students-variables.component.scss',
})
export class ModalRiskStudentsVariablesComponent implements OnInit {
  public componentNameMap: Record<string, string> = {
    academico: 'Academic',
    individual: 'Individual',
    familiar: 'Familiar',
    socioeconomico: 'Social',
  };
  private formBuilder = inject(FormBuilder);
  public filterForm: FormGroup;
  public data: DialogRiskVariableData = inject(MAT_DIALOG_DATA);
  public mappedData: MappedData[] = [];
  public filteredVariables: Variable[] = [];
  private reportService = inject(ReportService);
  public studentRisk = [];
  public displayedColumns: string[] = ['name', 'answer', 'risk', 'actions'];
  public selectedVaribleDisplay = '';
  public selectedPollName: string;
  public verbToActionTile = 'Get Top Risk Students By Variable';
  private previousFormVariableId: number | null = null;
  title = '';
  questionSelected = '';
  answerDetails = '';
  answerRiskAverage = '';
  constructor(
    public dialogRef: MatDialogRef<ModalRiskStudentsVariablesComponent>
  ) {
    this.filterForm = this.formBuilder.group({
      selectComponent: [[], Validators.required],
      selectVariables: [[], Validators.required],
      selectNumber: [null, Validators.min(1)],
    });
    this.selectedPollName = this.data.pollName;
  }

  ngOnInit(): void {
    this.mapSelectedHMData(this.data as unknown as SelectedHMData);
    this.mappedData = this.mapData(this.data.data as ComponentData[]);
  }

  onClose(): void {
    this.dialogRef.close();
  }

  onComponentChange(selectedComponent: string): void {
    const selectedData = this.mappedData.find(
      component => component.name === selectedComponent
    );
    this.filteredVariables = selectedData ? selectedData.variables : [];
    this.filterForm.get('selectVariables')?.setValue(null);
  }

  showStudentList(): void {
    if (this.filterForm.valid) {
      const selectedVariable =
        this.filterForm.get('selectVariables')?.value.variableId;
      this.selectedVaribleDisplay =
        this.filterForm.get('selectVariables')?.value.description;
      const pollInstanceUUID: string = this.data.pollUUID;
      const take: number | null = this.filterForm.get('selectNumber')?.value;

      if (selectedVariable === this.previousFormVariableId) return;

      this.reportService
        .getStudentsDetailByVariables(selectedVariable, pollInstanceUUID, take)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .subscribe((data: any) => {
          this.studentRisk = data.body;
          this.previousFormVariableId = selectedVariable;
        });
    }
  }
  getRiskColor(riskLevel: number): string {
    const riskColors = new Map([
      [1, '#008000'],
      [2, '#3CB371'],
      [3, '#F0D722'],
      [4, '#FFA500'],
      [5, '#FF0000'],
    ]);
    return riskColors.get(riskLevel) || '#FF0000';
  }

  private mapData(data: ComponentData[]): {
    name: string;
    variables: { variableId: number; description: string }[];
  }[] {
    return data?.map(component => ({
      name:
        this.componentNameMap[component.componentName] ||
        component.componentName,
      variables: component.variables.variables.map(variable => ({
        variableId: variable.variableId,
        description: variable.description,
      })),
    }));
  }

  private mapSelectedHMData(data: SelectedHMData): void {
    console.info('mapSelectedHMData', data);
    this.title = `Risk Heatmap - Cohort=${data.cohortId}: Poll=${data.pollUuid}`;
    this.questionSelected = data.selectedVariableDetails.x;
    this.answerDetails = data.selectedVariableDetails.z;
    this.answerRiskAverage = data.selectedVariableDetails.y;
  }
}
