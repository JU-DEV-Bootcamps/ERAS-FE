import { ERASRoles } from '@core/models/profile.model';

interface PermissionContext {
  currentProfessional: string;
  assignedProfessionals: string[];
}

type PermissionCheck = (
  userRole: ERASRoles,
  requiredRoles: ERASRoles[],
  context?: PermissionContext
) => boolean;

enum ERASPermissions {
  CAN_CREATE_SERVICES = 'CAN_CREATE_SERVICES',
  CAN_SEE_ASSESSMENT = 'CAN_SEE_ASSESSMENT',
  CAN_SEE_INTERVENTION = 'CAN_SEE_INTERVENTION',
  CAN_MANAGE_ASSESSMENT = 'CAN_MANAGE_ASSESSMENT',
  CAN_MANAGE_STUDENTS = 'CAN_MANAGE_STUDENTS',
  CAN_ADD_STUDENT_INTERVENTIONS = 'CAN_ADD_STUDENT_INTERVENTIONS',
  CAN_MANAGE_ANY_STUDENT_INTERVENTION = 'CAN_MANAGE_ANY_STUDENT_INTERVENTION',
}

const PermissionsRoles: Record<ERASPermissions, ERASRoles[]> = {
  CAN_CREATE_SERVICES: [ERASRoles.ADMIN],
  CAN_SEE_ASSESSMENT: [ERASRoles.ADMIN],
  CAN_SEE_INTERVENTION: [ERASRoles.ADMIN],
  CAN_MANAGE_ASSESSMENT: [ERASRoles.ADMIN, ERASRoles.OFFICER],
  CAN_MANAGE_STUDENTS: [ERASRoles.ADMIN, ERASRoles.OFFICER],
  CAN_ADD_STUDENT_INTERVENTIONS: [ERASRoles.ADMIN, ERASRoles.PROFESSIONAL],
  CAN_MANAGE_ANY_STUDENT_INTERVENTION: [ERASRoles.ADMIN],
};

const PermissionChecks: Record<ERASPermissions, PermissionCheck> = {
  CAN_CREATE_SERVICES: (role, requiredRoles) => requiredRoles.includes(role),
  CAN_SEE_ASSESSMENT: (role, requiredRoles, context) =>
    context
      ? context.assignedProfessionals.includes(context.currentProfessional) ||
        requiredRoles.includes(role)
      : requiredRoles.includes(role),
  CAN_SEE_INTERVENTION: (role, requiredRoles, context) =>
    context
      ? context.assignedProfessionals.includes(context.currentProfessional) ||
        requiredRoles.includes(role)
      : requiredRoles.includes(role),
  CAN_MANAGE_ASSESSMENT: (role, requiredRoles) => requiredRoles.includes(role),
  CAN_MANAGE_STUDENTS: (role, requiredRoles) => requiredRoles.includes(role),
  CAN_ADD_STUDENT_INTERVENTIONS: (role, requiredRoles) =>
    requiredRoles.includes(role),
  CAN_MANAGE_ANY_STUDENT_INTERVENTION: (role, requiredRoles) =>
    requiredRoles.includes(role),
};

export {
  ERASPermissions,
  PermissionsRoles,
  PermissionChecks,
  PermissionContext,
};
