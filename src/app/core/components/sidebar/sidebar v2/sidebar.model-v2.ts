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
      { label: 'Evaluation Processes', route: '/evaluation-process' },
      { label: 'Import Students', route: '/import-students' },
      { label: 'Students List', route: '/students' },
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
    route: '/assessments',
  },
];
