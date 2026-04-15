export interface Menu {
  label: string;
  icon?: string;
  route?: string;
  children?: Menu[];
  forProduction?: boolean;
}

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
    children: [
      { label: 'Dynamic Charts', route: '/reports/dynamic-charts' },
      { label: 'Summary Charts', route: '/reports/summary-charts' },
      { label: 'Polls Answered', route: '/reports/polls-answered' },
    ],
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

export const SIDEBAR_MENUS_OLD: Menu[] = [
  { label: 'Home', icon: 'home', route: '/home' },
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
      { label: 'Students List', icon: 'school', route: '/students' },
    ],
  },
  {
    label: 'Imports',
    icon: 'drive_folder_upload',
    children: [
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
