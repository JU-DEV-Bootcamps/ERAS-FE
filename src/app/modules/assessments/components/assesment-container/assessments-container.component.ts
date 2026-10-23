import { Component } from '@angular/core';
import {
  TabbedLayoutComponent,
  TabItem,
} from '@shared/components/tabbed-layout-component/tabbed-layout.component';

@Component({
  selector: 'app-assessments-container',
  imports: [TabbedLayoutComponent],
  template: `<app-tabbed-layout [tabs]="tabs" />`,
})
export class AssessmentsContainerComponent {
  tabs: TabItem[] = [
    { label: 'Assessments', route: 'assessments' },
    { label: 'Interventions', route: 'interventions' },
  ];
}
