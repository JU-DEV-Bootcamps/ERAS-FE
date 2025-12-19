import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  inject,
  input,
  OnInit,
} from '@angular/core';
import { AsyncPipe } from '@angular/common';

import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatGridListModule } from '@angular/material/grid-list';

import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { map, Observable } from 'rxjs';

import { CountSummaryModel } from '@core/models/summary.model';
import { StatsCardComponent } from '@shared/components/cards/stats-card/stats-card.component';

@Component({
  selector: 'app-summary-details',
  imports: [
    MatIconModule,
    MatCardModule,
    StatsCardComponent,
    MatGridListModule,
    AsyncPipe,
  ],
  templateUrl: './summary-details.component.html',
  styleUrl: './summary-details.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class SummaryDetailsComponent implements OnInit {
  cardsGridColumns$: Observable<number> | undefined;
  breakpointObserver = inject(BreakpointObserver);
  summary = input<CountSummaryModel>();

  ngOnInit() {
    this.cardsGridColumns$ = this.breakpointObserver
      .observe([Breakpoints.XSmall, Breakpoints.Small])
      .pipe(
        map(result => {
          if (result.breakpoints[Breakpoints.XSmall]) {
            return 1;
          }
          if (result.breakpoints[Breakpoints.Small]) {
            return 3;
          }
          return 3; // Desktop Screen - Default number of columns.
        })
      );
  }
}
