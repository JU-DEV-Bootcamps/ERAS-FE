import { Component, Input } from '@angular/core';
@Component({
  selector: 'app-stats-card-v2',
  imports: [],
  templateUrl: './stats-card-v2.component.html',
  styleUrl: './stats-card-v2.component.scss',
})
export class StatsCardV2Component {
  @Input() title!: string;
  @Input() value!: number;
  @Input() percentage!: string;
}
