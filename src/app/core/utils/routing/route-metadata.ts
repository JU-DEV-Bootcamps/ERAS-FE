import { ERASRoles } from '@core/models/profile.model';
import { AppRouteData } from '@core/models/route-data.model';

export const ROUTE_METADATA = {
  HOME: {
    breadcrumb: 'Home',
    headerTitle: 'Home',
  },
  REPORTS: {
    breadcrumb: 'Reports',
    headerTitle: 'Reports',
    roles: [ERASRoles.ADMIN, ERASRoles.OFFICER],
  },
  REPORTS_V1: {
    breadcrumb: 'Reports',
    roles: [ERASRoles.ADMIN, ERASRoles.OFFICER],
  },
  COSMIC_LATTE: {
    breadcrumb: 'Cosmic Latte',
    roles: [ERASRoles.ADMIN, ERASRoles.OFFICER],
  },
  EVALUATION_PROCESS: {
    headerTitle: 'Evaluation Process',
    breadcrumb: 'Evaluation Process',
    roles: [ERASRoles.ADMIN, ERASRoles.OFFICER],
  },
  IMPORT_PREVIEW: {
    breadcrumb: 'Import Answers',
    roles: [ERASRoles.ADMIN, ERASRoles.OFFICER],
  },
  IMPORT_STATUS: {
    headerTitle: 'Import Progress',
    breadcrumb: 'Import Progress',
    roles: [ERASRoles.ADMIN, ERASRoles.OFFICER],
  },
  LIST_STUDENTS: {
    breadcrumb: 'Students List By Poll',
    roles: [ERASRoles.ADMIN, ERASRoles.OFFICER],
  },
  STUDENTS: {
    breadcrumb: 'Students',
    headerTitle: 'Students',
    roles: [ERASRoles.ADMIN, ERASRoles.OFFICER],
  },
  RISK_STUDENTS: {
    breadcrumb: 'Risk Students',
    roles: [ERASRoles.ADMIN, ERASRoles.OFFICER],
  },
  ASSESSMENTS: {
    breadcrumb: 'Assessments',
    headerTitle: 'Assessments',
    roles: [ERASRoles.ADMIN, ERASRoles.OFFICER, ERASRoles.PROFESSIONAL],
  },
  STUDENT_MONITORING_POLLS: {
    breadcrumb: 'Student Monitoring Polls',
    roles: [ERASRoles.ADMIN, ERASRoles.OFFICER],
  },
  STUDENT_MONITORING_COHORTS: {
    breadcrumb: 'Student Monitoring Cohorts',
    roles: [ERASRoles.ADMIN, ERASRoles.OFFICER],
  },
  STUDENT_MONITORING_DETAILS: {
    breadcrumb: 'Student Monitoring Details',
    roles: [ERASRoles.ADMIN, ERASRoles.OFFICER],
  },
  RECENT_ALERTS: {
    headerTitle: 'Recent Alerts',
  },
} as const satisfies Record<string, AppRouteData>;
