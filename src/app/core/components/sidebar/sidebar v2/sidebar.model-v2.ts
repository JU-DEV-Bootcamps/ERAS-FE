import { ERASRoles } from '@core/models/profile.model';
import { Menu } from '../sidebar.model';

export const SIDEBAR_MENUS_NEW: Menu[] = [
  {
    label: 'Home',
    icon: 'home',
    route: '/home',
    requiredRoles: [ERASRoles.ADMIN, ERASRoles.OFFICER, ERASRoles.PROFESSIONAL],
  },
  {
    label: 'Students',
    icon: 'school',
    route: '/students',
    requiredRoles: [ERASRoles.ADMIN, ERASRoles.OFFICER],
  },
  {
    label: 'Evaluation Processes',
    icon: 'playlist_add_check',
    route: '/evaluation-process',
    requiredRoles: [ERASRoles.ADMIN, ERASRoles.OFFICER],
  },
  {
    label: 'Reports',
    icon: 'assessment',
    route: '/reports',
    requiredRoles: [ERASRoles.ADMIN, ERASRoles.OFFICER],
  },
  {
    label: 'Assessments',
    icon: 'link',
    route: '/assessments',
    requiredRoles: [ERASRoles.ADMIN, ERASRoles.OFFICER, ERASRoles.PROFESSIONAL],
  },
];
