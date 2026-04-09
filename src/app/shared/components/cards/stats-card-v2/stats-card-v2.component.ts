import { NgClass } from '@angular/common';
import { Component, computed, input } from '@angular/core';
import { MatCard } from '@angular/material/card';

@Component({
  selector: 'app-stats-card-v2',
  imports: [MatCard, NgClass],
  templateUrl: './stats-card-v2.component.html',
  styleUrl: './stats-card-v2.component.scss',
})
export class StatsCardV2Component {
  title = input<string>('');
  value = input<number>(0);
  percentageChange = input<number>(0);

  isPositive = computed(() => this.percentageChange() >= 0);
  formattedPercentage = computed(() => {
    const val = this.percentageChange();
    return `${val > 0 ? '↑' : '↓'} ${Math.abs(val)}%`;
  });
}
