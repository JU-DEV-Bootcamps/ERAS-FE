import { Routes } from '@angular/router';
import { StudentsContainerComponent } from './students-container.component';

export const STUDENT_ROUTES: Routes = [
  {
    path: '',
    component: StudentsContainerComponent,
    data: {
      breadcrumb: 'Students List',
      headerTitle: 'Students',
    },
  },
];
