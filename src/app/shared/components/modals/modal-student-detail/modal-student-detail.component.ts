import { AfterViewInit, Component, Inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { StudentDetailComponent } from './student-detail/student-detail.component';

interface DialogData {
  studentId: number;
}

@Component({
  selector: 'app-modal-student-detail',
  imports: [MatDialogModule, MatButtonModule, StudentDetailComponent],
  templateUrl: './modal-student-detail.component.html',
  styleUrl: './modal-student-detail.component.scss',
})
export class ModalStudentDetailComponent implements AfterViewInit {
  constructor(
    public dialogRef: MatDialogRef<ModalStudentDetailComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) {}

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.dialogRef.updateSize('auto');
    });
  }

  delete() {
    this.dialogRef.close();
  }

  closeDialog(): void {
    this.dialogRef.close();
  }
}
