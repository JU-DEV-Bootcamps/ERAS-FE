import { AppRouteData } from '@core/models/route-data.model';

export const ROUTE_METADATA = {
  HOME: {
    breadcrumb: 'Home',
    headerTitle: 'Home',
  },
  REPORTS: {
    breadcrumb: 'Reports',
    headerTitle: 'Reports',
  },
  REPORTS_V1: {
    breadcrumb: 'Reports',
  },
  COSMIC_LATTE: {
    breadcrumb: 'Cosmic Latte',
  },
  EVALUATION_PROCESS: {
    breadcrumb: 'Evaluation Process',
  },
  IMPORT_PREVIEW: {
    breadcrumb: 'Import Answers',
  },
  IMPORT_STATUS: {
    headerTitle: 'Import Progress',
    breadcrumb: 'Import Progress',
  },
  LIST_STUDENTS: {
    breadcrumb: 'Students List By Poll',
  },
  STUDENTS: {
    breadcrumb: 'Students',
    headerTitle: 'Students',
  },
  RISK_STUDENTS: {
    breadcrumb: 'Risk Students',
  },
  ASSESSMENTS: {
    breadcrumb: 'Assessments',
    headerTitle: 'Assessments',
  },
  STUDENT_MONITORING_POLLS: {
    breadcrumb: 'Student Monitoring Polls',
  },
  STUDENT_MONITORING_COHORTS: {
    breadcrumb: 'Student Monitoring Cohorts',
  },
  STUDENT_MONITORING_DETAILS: {
    breadcrumb: 'Student Monitoring Details',
  },
  RECENT_ALERTS: {
    headerTitle: 'Recent Alerts',
  },
} as const satisfies Record<string, AppRouteData>;
