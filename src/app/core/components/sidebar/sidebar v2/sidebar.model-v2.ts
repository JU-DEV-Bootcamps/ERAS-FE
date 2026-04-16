import { Menu } from '../sidebar.model';

export const SIDEBAR_MENUS_NEW: Menu[] = [
  { label: 'Home', icon: 'home', route: '/home' },
  {
    label: 'Students',
    icon: 'school',
    children: [
      {
        label: 'Student Monitoring',
        route: '/student-option',
        forProduction: false,
      },
      { label: 'Students List', route: '/list-students-by-poll' },
    ],
  },
  {
    label: 'Reports',
    icon: 'assessment',
    route: '/reports',
  },
  {
    label: 'Assessments',
    icon: 'link',
    children: [
      { label: 'Evaluation Processes', route: '/evaluation-process' },
      {
        label: 'Supports and Referrals',
        route: '/supports-referrals',
        forProduction: false,
      },
      { label: 'Import Students', route: '/import-students' },
    ],
  },
];
