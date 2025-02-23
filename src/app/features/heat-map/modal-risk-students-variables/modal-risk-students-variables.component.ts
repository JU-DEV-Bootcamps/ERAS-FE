import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
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
  ],
  templateUrl: './modal-risk-students-variables.component.html',
  styleUrl: './modal-risk-students-variables.component.scss',
})
export class ModalRiskStudentsVariablesComponent implements OnInit {
  public componentNameMap: Record<string, string> = {
    academico: 'Academic',
    individual: 'Individual',
    familiar: 'Familiar',
    socioeconomico: 'Socioeconomic',
  };
  private formBuilder = inject(FormBuilder);
  public filterForm = this.formBuilder.group({
    selectComponent: [Validators.required],
    selectVariables: [Validators.required],
  });
  public data: DialogRiskVariableData = inject(MAT_DIALOG_DATA);
  public mappedData: MappedData[] = [];
  public filteredVariables: Variable[] = [];
  constructor(
    public dialogRef: MatDialogRef<ModalRiskStudentsVariablesComponent>
  ) {}

  ngOnInit(): void {
    this.mappedData = this.mapData(this.data.data as ComponentData[]);
    console.log(this.mappedData);
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
