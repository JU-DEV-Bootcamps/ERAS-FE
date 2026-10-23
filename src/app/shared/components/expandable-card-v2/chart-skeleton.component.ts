import { Component } from '@angular/core';

@Component({
  selector: 'app-chart-skeleton',
  imports: [],
  templateUrl: './chart-skeleton.component.html',
  styleUrl: './chart-skeleton.component.scss',
})
export class ChartSkeletonComponent {
  skeletonColors = [
    '#d1d5db',
    '#86efac',
    '#4ade80',
    '#fbbf24',
    '#fb923c',
    '#f87171',
  ];

  skeletonRows = [
    {
      labelWidth: 142,
      cells: [
        { width: 52, color: '#86efac', delay: 0 },
        { width: 52, color: '#fb923c', delay: 0.05 },
        { width: 52, color: '#f87171', delay: 0.1 },
      ],
    },
    { labelWidth: 142, cells: [{ width: 52, color: '#86efac', delay: 0.06 }] },
    {
      labelWidth: 142,
      cells: [
        { width: 52, color: '#86efac', delay: 0.12 },
        { width: 52, color: '#fb923c', delay: 0.17 },
        { width: 52, color: '#f87171', delay: 0.22 },
      ],
    },
    {
      labelWidth: 142,
      cells: [
        { width: 52, color: '#86efac', delay: 0.18 },
        { width: 52, color: '#fb923c', delay: 0.23 },
      ],
    },
    {
      labelWidth: 142,
      cells: [
        { width: 52, color: '#86efac', delay: 0.24 },
        { width: 52, color: '#fb923c', delay: 0.29 },
      ],
    },
    { labelWidth: 142, cells: [{ width: 52, color: '#fb923c', delay: 0.3 }] },
    { labelWidth: 142, cells: [{ width: 72, color: '#4ade80', delay: 0.36 }] },
    { labelWidth: 142, cells: [{ width: 52, color: '#86efac', delay: 0.42 }] },
    {
      labelWidth: 142,
      cells: [
        { width: 52, color: '#86efac', delay: 0.48 },
        { width: 72, color: '#4ade80', delay: 0.53 },
        { width: 52, color: '#fbbf24', delay: 0.58 },
      ],
    },
    {
      labelWidth: 142,
      cells: [
        { width: 52, color: '#86efac', delay: 0.54 },
        { width: 52, color: '#f87171', delay: 0.59 },
      ],
    },
    {
      labelWidth: 142,
      cells: [
        { width: 52, color: '#86efac', delay: 0.6 },
        { width: 52, color: '#fb923c', delay: 0.65 },
      ],
    },
  ];
}
