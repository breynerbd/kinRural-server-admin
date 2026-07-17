import { ROLES } from "../constants/roles.js";

export const canManageUser = (actorRole, targetRole) => {
  if (
    actorRole === ROLES.ADMIN &&
    [ROLES.ADMIN, ROLES.MASTER_ADMIN].includes(targetRole)
  ) {
    return false;
  }

  return true;
};
export const canAssignRole = (actorRole, targetRole) => {
  if (
    actorRole === ROLES.ADMIN &&
    [ROLES.ADMIN, ROLES.MASTER_ADMIN].includes(targetRole)
  ) {
    return false;
  }

  if (targetRole === ROLES.MASTER_ADMIN && actorRole !== ROLES.MASTER_ADMIN) {
    return false;
  }

  return true;
};
export const canDeleteUser = (actorRole, actorAuthId, targetUser) => {
  if (targetUser.auth_id === actorAuthId) return false;

  if (
    actorRole === ROLES.ADMIN &&
    [ROLES.ADMIN, ROLES.MASTER_ADMIN].includes(targetUser.role)
  ) {
    return false;
  }

  return true;
};
