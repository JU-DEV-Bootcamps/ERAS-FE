import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { NgApexchartsModule } from 'ng-apexcharts';
import { PollModel } from '@core/models/poll.model';
import { PollService } from '@core/services/api/poll.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-student-monitoring-polls',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    NgApexchartsModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    MatDialogModule,
    MatExpansionModule,
    MatSlideToggleModule,
    MatFormFieldModule,
    MatTabsModule,
    MatCardModule,
    CommonModule,
    MatRadioModule,
    MatTableModule,
    MatDividerModule,
  ],
  templateUrl: './student-monitoring-polls.component.html',
  styleUrls: ['./student-monitoring-polls.component.scss'],
})
export class StudentMonitoringPollsComponent implements OnInit {
  polls: PollModel[] = [];
  pollSelectedId: number | null = null;
  pollSelected: PollModel | null = null;
  lastVersion = true;

  constructor(
    private pollService: PollService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.pollService.getAllPolls().subscribe(polls => {
      this.polls = polls;
    });
  }

  selectVersion(event: Event): void {
    const selectedValue = (event.target as HTMLSelectElement).value;
    this.lastVersion = selectedValue === 'true';
  }

  selectPoll(): void {
    const selectedPoll = this.polls.find(p => p.id === this.pollSelectedId);
    if (selectedPoll) {
      this.pollSelected = selectedPoll;
      this.router.navigate([
        '/student-option',
        selectedPoll.uuid,
        this.lastVersion,
      ]);
    }
  }
}
