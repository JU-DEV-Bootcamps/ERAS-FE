import {
  Component,
  ElementRef,
  HostListener,
  Input,
  ViewChild,
  OnChanges,
} from '@angular/core';
import { MatMenuModule } from '@angular/material/menu';
import { CommonModule } from '@angular/common';

export interface StudentProfileData {
  id: number;
  name: string;
  email: string;
  avgRiskLevel: number;
}

@Component({
  selector: 'app-assessment-student-data',
  imports: [MatMenuModule, CommonModule],
  templateUrl: './assessment-student-data.component.html',
  styleUrl: './assessment-student-data.component.scss',
})
export class AssessmentStudentDataComponent implements OnChanges {
  @Input({ required: true }) studentData!: StudentProfileData[];
  @Input({ required: false }) numberOfStudent = 1;
  @ViewChild('badgeRef') badgeRef!: ElementRef;

  show = false;
  pinned = false;
  popoverStyle: Record<string, string> = {};
  studentNames = '';

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const clickedInside = this.badgeRef?.nativeElement.contains(event.target);
    if (!clickedInside) {
      this.pinned = false;
      this.show = false;
    }
  }

  ngOnChanges() {
    this.studentNames = this.studentData
      .slice(0, this.numberOfStudent)
      .map(st => st.name)
      .join(', ');
  }

  openPopover() {
    const rect = this.badgeRef.nativeElement.getBoundingClientRect();
    const popoverHeight = 360;
    const spaceBelow = window.innerHeight - rect.bottom;
    const showAbove = spaceBelow < popoverHeight;

    this.popoverStyle = {
      left: `${rect.left}px`,
      ...(showAbove
        ? { bottom: `${window.innerHeight - rect.top + 6}px` }
        : { top: `${rect.bottom + 6}px` }),
    };
    this.show = true;
    setTimeout(() => {
      const panel = document.querySelector('.students-popover');
      if (panel) panel.scrollTop = 0;
    });
  }

  closePopover() {
    if (!this.pinned) this.show = false;
  }

  togglePin() {
    this.pinned = !this.pinned;
    if (!this.pinned) this.show = false;
  }
}
