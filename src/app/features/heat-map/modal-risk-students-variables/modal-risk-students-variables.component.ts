import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
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
  constructor(
    public dialogRef: MatDialogRef<ModalRiskStudentsVariablesComponent>
  ) {
    this.filterForm = this.formBuilder.group({
      selectComponent: [[], Validators.required],
      selectVariables: [[], Validators.required],
      selectNumber: [Validators.min(1)],
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
      return;
    }
  }

  private mapData(
    data: ComponentData[]
  ): { name: string; variables: { id: number; description: string }[] }[] {
    return data.map(component => ({
      name:
        this.componentNameMap[component.componentName] ||
        component.componentName,
      variables: component.variables.variables.map(variable => ({
        id: variable.id,
        description: variable.description,
      })),
    }));
  }
}
