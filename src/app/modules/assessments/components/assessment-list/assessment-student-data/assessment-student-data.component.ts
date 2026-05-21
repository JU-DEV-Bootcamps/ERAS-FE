import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { MatMenuModule } from '@angular/material/menu';
import { CommonModule } from '@angular/common';

export interface StudentProfileData {
  id: number;
  name: string;
  email: string;
}

@Component({
  selector: 'app-assessment-student-data',
  imports: [MatMenuModule, CommonModule],
  templateUrl: './assessment-student-data.component.html',
  styleUrl: './assessment-student-data.component.scss',
})
export class AssessmentStudentDataComponent {
  @Input({ required: true }) studentData!: StudentProfileData[];
  @ViewChild('badgeRef') badgeRef!: ElementRef;

  show = false;
  popoverStyle: Record<string, string> = {};

  openPopover() {
    const rect = this.badgeRef.nativeElement.getBoundingClientRect();
    this.popoverStyle = {
      top: `${rect.bottom + 6}px`,
      left: `${rect.left}px`,
    };
    this.show = true;
  }

  closePopover() {
    this.show = false;
  }
}
