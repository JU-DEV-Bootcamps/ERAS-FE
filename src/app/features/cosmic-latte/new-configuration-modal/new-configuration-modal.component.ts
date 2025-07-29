import { ServiceProvidersService } from './../../../core/services/api/service-providers.service';
import { Component, Inject, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ServiceProviderModel } from '../../../core/models/service-providers.model';
import { CommonModule } from '@angular/common';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { ConfigurationsModel } from '../../../core/models/configurations.model';

@Component({
  selector: 'app-new-configuration-modal',
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatDialogModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    FormsModule,
    MatOptionModule,
    ReactiveFormsModule,
  ],
  templateUrl: './new-configuration-modal.component.html',
  styleUrl: './new-configuration-modal.component.css',
})
export class NewConfigurationModalComponent implements OnInit {
  configurationForm!: FormGroup;
  serviceProviders: ServiceProviderModel[] = [];
  existingConfiguration?: ConfigurationsModel;

  constructor(
    private fb: FormBuilder,
    private serviceProvidersService: ServiceProvidersService,
    public dialogRef: MatDialogRef<NewConfigurationModalComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: { existingConfiguration?: ConfigurationsModel }
  ) {}

  ngOnInit(): void {
    this.existingConfiguration = this.data?.existingConfiguration;

    this.configurationForm = this.fb.group({
      configurationName: ['', Validators.required],
      baseURL: ['', Validators.required],
      apiKey: [
        '',
        [
          Validators.required,
          Validators.minLength(32),
          Validators.maxLength(32),
        ],
      ],
      serviceProvider: ['', Validators.required],
    });

    if (this.existingConfiguration) {
      this.configurationForm.patchValue({
        configurationName: this.existingConfiguration.configurationName,
        baseURL: this.existingConfiguration.baseURL,
        apiKey: this.existingConfiguration.encryptedKey,
        serviceProvider: this.existingConfiguration.serviceProviderId,
      });
    }

    this.loadServiceProviders();
  }

  loadServiceProviders() {
    this.serviceProvidersService.getAllServiceProviders().subscribe({
      next: response => {
        this.serviceProviders = response;
      },
      error: error => {
        console.error('Error while loading service providers', error);
      },
    });
  }

  close() {
    this.dialogRef.close();
  }

  saveConfiguration() {
    if (this.configurationForm.valid) {
      const formValue = this.configurationForm.value;

      const result: ConfigurationsModel = {
        ...formValue,
        id: this.existingConfiguration?.id ?? null,
      };

      this.dialogRef.close(result);
    } else {
      console.error('Form is invalid');
    }
  }

  preventAction(event: ClipboardEvent) {
    event.preventDefault();
  }
}
