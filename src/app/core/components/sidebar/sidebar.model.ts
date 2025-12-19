export interface Menu {
  label: string;
  icon?: string;
  route?: string;
  children?: Menu[];
  forProduction?: boolean;
}

export const SIDEBAR_MENUS: Menu[] = [
  {
    label: 'Home',
    icon: 'home',
    route: '/home',
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
    children: [
      {
        label: 'Referrals',
        icon: 'group_add',
        route: '/supports-referrals',
      },
    ],
    forProduction: false,
  },
  {
    label: 'Reports',
    icon: 'pie_chart_outline',
    children: [
      {
        label: 'Dynamic Charts',
        icon: 'description',
        route: '/reports/dynamic-charts',
      },
      {
        label: 'Summary Charts',
        icon: 'find_in_page',
        route: '/reports/summary-charts',
      },
      {
        label: 'Polls Answered',
        icon: 'poll',
        route: '/reports/polls-answered',
      },
    ],
  },
  {
    label: 'Lists',
    icon: 'view_list',
    children: [
      {
        label: 'Evaluation Processes',
        icon: 'fact_check_outline',
        route: '/evaluation-process',
      },
      {
        label: 'Students List',
        icon: 'school',
        route: '/list-students-by-poll',
      },
    ],
  },
  {
    label: 'Imports',
    icon: 'drive_folder_upload',
    children: [
      {
        label: 'Import Polls',
        icon: 'insert_chart_outlined',
        route: '/import-answers',
      },
      {
        label: 'Import Students',
        icon: 'person_add',
        route: '/import-students',
      },
    ],
  },
  {
    label: 'Settings',
    icon: 'settings',
    children: [
      {
        label: 'Service Providers',
        icon: 'check_circle',
        route: '/cosmic-latte',
      },
    ],
  },
];
