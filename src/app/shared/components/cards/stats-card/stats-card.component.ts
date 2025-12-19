import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { MatCard, MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-stats-card',
  imports: [MatCard, MatCardModule, MatIconModule, RouterLink],
  templateUrl: './stats-card.component.html',
  styleUrl: './stats-card.component.scss',
})
export class StatsCardComponent {
  url = input<string>();
}
