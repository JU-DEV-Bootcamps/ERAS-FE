import { Component } from '@angular/core';
import {
  TabbedLayoutComponent,
  TabItem,
} from '@shared/components/tabbed-layout-component/tabbed-layout.component';

@Component({
  selector: 'app-reports',
  imports: [TabbedLayoutComponent],
  template: `<app-tabbed-layout [tabs]="tabs" />`,
})
export class ReportsComponent {
  tabs: TabItem[] = [
    { label: 'Dynamic Charts', route: 'dynamic-charts' },
    { label: 'Summary Charts', route: 'summary-charts' },
    { label: 'Polls Answered', route: 'polls-answered' },
  ];
}
