import { ERASRoles } from '@core/models/profile.model';

interface PermissionContext {
  currentProfessional: string;
  assignedProfessional: string;
}

type PermissionCheck = (
  userRole: ERASRoles,
  requiredRoles: ERASRoles[],
  context?: PermissionContext
) => boolean;

enum ERASPermissions {
  CAN_CREATE_PROFESSIONALS = 'CAN_CREATE_PROFESSIONALS',
  CAN_CREATE_SERVICES = 'CAN_CREATE_SERVICES',
  CAN_SEE_ASSESSMENT = 'CAN_SEE_ASSESSMENT',
  CAN_SEE_INTERVENTION = 'CAN_SEE_INTERVENTION',
}

const PermissionsRoles: Record<ERASPermissions, ERASRoles[]> = {
  CAN_CREATE_PROFESSIONALS: [ERASRoles.ADMIN],
  CAN_CREATE_SERVICES: [ERASRoles.ADMIN],
  CAN_SEE_ASSESSMENT: [ERASRoles.ADMIN],
  CAN_SEE_INTERVENTION: [ERASRoles.ADMIN],
};

const PermissionChecks: Record<ERASPermissions, PermissionCheck> = {
  CAN_CREATE_PROFESSIONALS: (role, requiredRoles) =>
    requiredRoles.includes(role),
  CAN_CREATE_SERVICES: (role, requiredRoles) => requiredRoles.includes(role),
  CAN_SEE_ASSESSMENT: (role, requiredRoles, context) =>
    context
      ? context.currentProfessional === context.assignedProfessional ||
        requiredRoles.includes(role)
      : requiredRoles.includes(role),
  CAN_SEE_INTERVENTION: (role, requiredRoles, context) =>
    context
      ? context.currentProfessional === context.assignedProfessional ||
        requiredRoles.includes(role)
      : requiredRoles.includes(role),
};

export {
  ERASPermissions,
  PermissionsRoles,
  PermissionChecks,
  PermissionContext,
};
