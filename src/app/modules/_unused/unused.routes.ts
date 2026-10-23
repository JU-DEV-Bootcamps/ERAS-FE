import { Routes } from '@angular/router';
import { RiskStudentsComponent } from '@modules/_unused/experimental/risk-students/risk-students.component';
import { StudentMonitoringCohortsComponent } from '@modules/_unused/experimental/student-monitoring/student-monitoring-cohorts/student-monitoring-cohorts.component';
import { StudentMonitoringDetailsComponent } from '@modules/_unused/experimental/student-monitoring/student-monitoring-details/student-monitoring-details.component';
import { StudentMonitoringPollsComponent } from '@modules/_unused/experimental/student-monitoring/student-monitoring-polls/student-monitoring-polls.component';

export const UNUSED_ROUTES: Routes = [
  {
    path: '',
    children: [
      {
        path: 'risk-students',
        component: RiskStudentsComponent,
        data: { breadcrumb: 'Risk Students' },
      },
      {
        path: 'student-option',
        component: StudentMonitoringPollsComponent,
        data: { breadcrumb: 'Student Monitoring Polls' },
        children: [
          {
            path: ':pollUuid/:lastVersion',
            component: StudentMonitoringCohortsComponent,
            data: { breadcrumb: 'Student Monitoring Cohorts' },
          },
          {
            path: ':pollUuid/:lastVersion/:cohortId',
            component: StudentMonitoringDetailsComponent,
            data: { breadcrumb: 'Student Monitoring Details' },
          },
        ],
      },
    ],
  },
];
