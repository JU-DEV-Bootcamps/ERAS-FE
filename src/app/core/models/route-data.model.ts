import { ERASRoles } from './profile.model';

export interface AppRouteData {
  breadcrumb?: string;
  headerTitle?: string;
  roles?: ERASRoles[];
}
