import { Component, Input } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

export interface TabItem {
  label: string;
  route: string;
}

@Component({
  selector: 'app-tabbed-layout',
  imports: [CommonModule, RouterModule],
  templateUrl: './tabbed-layout.component.html',
  styleUrl: './tabbed-layout.component.scss',
})
export class TabbedLayoutComponent {
  @Input() tabs: TabItem[] = [];
}
