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
import { MatChipsModule } from '@angular/material/chips';
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
    MatChipsModule,
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
  displayedColumns: string[] = ['name', 'answer', 'risk'];
  constructor(
    public dialogRef: MatDialogRef<ModalRiskStudentsVariablesComponent>
  ) {
    this.filterForm = this.formBuilder.group({
      selectComponent: [[], Validators.required],
      selectVariables: [[], Validators.required],
      selectNumber: [null, Validators.min(1)],
    });
  }

  ngOnInit(): void {
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
      const pollInstanceUUID: string = this.data.pollUUID;
      const take: number | null = this.filterForm.get('selectNumber')?.value;
      this.reportService
        .getStudentsDetailByVariables(selectedVariable, pollInstanceUUID, take)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .subscribe((data: any) => {
          this.studentRisk = data.body;
        });
    }
  }
  getRiskColor(riskLevel: number): string {
    const riskColors = new Map([
      [1, '#4CAF50'], // Verde
      [2, '#FFC107'], // Amber
      [3, '#FF9800'], // Orange
      [4, '#F44336'], // Red
      [5, '#9C27B0'], // Purple
    ]);
    return riskColors.get(riskLevel) || '#607D8B'; // Default grey
  }

  private mapData(data: ComponentData[]): {
    name: string;
    variables: { variableId: number; description: string }[];
  }[] {
    return data.map(component => ({
      name:
        this.componentNameMap[component.componentName] ||
        component.componentName,
      variables: component.variables.variables.map(variable => ({
        variableId: variable.variableId,
        description: variable.description,
      })),
    }));
  }
}
