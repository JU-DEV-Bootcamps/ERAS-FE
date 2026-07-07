import { Menu } from '../sidebar.model';

export const SIDEBAR_MENUS_NEW: Menu[] = [
  { label: 'Home', icon: 'home', route: '/home' },
  {
    label: 'Students',
    icon: 'school',
    route: '/students',
  },
  {
    label: 'Evaluation Processes',
    icon: 'playlist_add_check',
    route: '/evaluation-process',
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
