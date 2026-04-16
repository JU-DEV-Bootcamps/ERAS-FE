import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-reports',
  imports: [CommonModule, RouterModule],
  templateUrl: './reports.component.html',
  styleUrl: './reports.component.scss',
})
export class ReportsComponent {
  tabs = [
    { label: 'Dynamic Charts', route: 'dynamic-charts' },
    { label: 'Summary Charts', route: 'summary-charts' },
    { label: 'Polls Answered', route: 'polls-answered' },
  ];
}
