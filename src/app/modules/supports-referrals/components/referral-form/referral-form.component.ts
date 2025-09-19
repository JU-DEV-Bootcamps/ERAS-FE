import { CommonModule } from '@angular/common';
import {
  Component,
  computed,
  CUSTOM_ELEMENTS_SCHEMA,
  EventEmitter,
  inject,
  OnInit,
  Output,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { provideNativeDateAdapter } from '@angular/material/core';

@Component({
  selector: 'app-referral-form',
  providers: [provideNativeDateAdapter()],
  imports: [
    CommonModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatInputModule,
    MatRadioModule,
    MatSelectModule,
    ReactiveFormsModule,
  ],
  templateUrl: './referral-form.component.html',
  styleUrl: './referral-form.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class ReferralFormComponent implements OnInit {
  @Output() formReady = new EventEmitter<FormGroup>();

  //Services
  matDialogData = inject(MAT_DIALOG_DATA);
  fb = inject(FormBuilder);

  //Signals
  lookups = computed(() => {
    return this.matDialogData.data;
  });

  //Variables
  form!: FormGroup;
  ngOnInit() {
    this.form = this.fb.group({
      comment: [''],
      date: [{ value: new Date(), disabled: true }, Validators.required],
      professional: [null, Validators.required],
      service: [null, Validators.required],
      student: [null, Validators.required],
      submitter: [this.lookups().profiles[0]?.id, Validators.required],
    });
    this.formReady.emit(this.form);
  }
}
