import { ERASRoles } from '@core/models/profile.model';

export interface Menu {
  label: string;
  icon?: string;
  route?: string;
  children?: Menu[];
  forProduction?: boolean;
  requiredRoles?: ERASRoles[];
}

export const SIDEBAR_MENUS_OLD: Menu[] = [
  {
    label: 'Home',
    icon: 'home',
    route: '/home',
    requiredRoles: [ERASRoles.ADMIN, ERASRoles.OFFICER, ERASRoles.PROFESSIONAL],
  },
  {
    label: 'Student Monitoring',
    icon: 'groups',
    route: '/student-option',
    forProduction: false,
  },
  {
    label: 'Supports and Referrals',
    icon: 'link',
    forProduction: false,
    children: [
      { label: 'Referrals', icon: 'group_add', route: '/supports-referrals' },
    ],
  },
  {
    label: 'Reports',
    icon: 'pie_chart_outline',
    children: [
      {
        label: 'Dynamic Charts',
        icon: 'description',
        route: '/reports-v1/dynamic-charts',
        requiredRoles: [ERASRoles.ADMIN, ERASRoles.OFFICER],
      },
      {
        label: 'Summary Charts',
        icon: 'find_in_page',
        route: '/reports-v1/summary-charts',
        requiredRoles: [ERASRoles.ADMIN, ERASRoles.OFFICER],
      },
      {
        label: 'Polls Answered',
        icon: 'poll',
        route: '/reports-v1/polls-answered',
        requiredRoles: [ERASRoles.ADMIN, ERASRoles.OFFICER],
      },
    ],
    requiredRoles: [ERASRoles.ADMIN, ERASRoles.OFFICER],
  },
  {
    label: 'Lists',
    icon: 'view_list',
    children: [
      {
        label: 'Evaluation Processes',
        icon: 'fact_check_outline',
        route: '/evaluation-process',
        requiredRoles: [ERASRoles.ADMIN, ERASRoles.OFFICER],
      },
      {
        label: 'Students List',
        icon: 'school',
        route: '/list-students-by-poll',
        requiredRoles: [ERASRoles.ADMIN, ERASRoles.OFFICER],
      },
    ],
    requiredRoles: [ERASRoles.ADMIN, ERASRoles.OFFICER],
  },
  {
    label: 'Imports',
    icon: 'drive_folder_upload',
    children: [
      {
        label: 'Import Students',
        icon: 'person_add',
        route: '/students',
        requiredRoles: [ERASRoles.ADMIN, ERASRoles.OFFICER],
      },
    ],
    requiredRoles: [ERASRoles.ADMIN, ERASRoles.OFFICER],
  },
  {
    label: 'Settings',
    icon: 'settings',
    children: [
      {
        label: 'Service Providers',
        icon: 'check_circle',
        route: '/cosmic-latte',
        requiredRoles: [ERASRoles.ADMIN, ERASRoles.OFFICER],
      },
    ],
    requiredRoles: [ERASRoles.ADMIN, ERASRoles.OFFICER],
  },
];
