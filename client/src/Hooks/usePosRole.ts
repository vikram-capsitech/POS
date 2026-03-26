import { useParams } from "react-router-dom";
import { useAuthStore } from "../Store/store";

/**
 * Resolves the effective POS role for the current org.
 *
 * Priority:
 *  1. session.role  (set for admin / superadmin at the system level)
 *  2. orgAccess[orgId].roleName  (set for employees with a custom org-role like "kitchen")
 *
 * Returns a lower-cased string like "admin", "kitchen", "waiter", "employee", etc.
 * Returns null when no role can be determined.
 */
export function usePosRole(): string | null {
  const { orgId } = useParams<{ orgId: string }>();
  const session = useAuthStore((s) => s.session);

  // System-level role takes precedence (admin / superadmin)
  if (session.role) return session.role.toLowerCase();

  // Fall back to the org-scoped role for custom-role employees
  if (orgId) {
    const orgAccess = session.orgAccess?.[orgId];
    if (orgAccess?.roleName) return orgAccess.roleName.toLowerCase();
  }

  return null;
}

/**
 * POS section role buckets — extend these lists if new role names are added in the backend.
 */
export const KITCHEN_ROLES = ["kitchen", "chef", "cook", "kds"];
export const WAITER_ROLES  = ["waiter", "server"];

/**
 * Returns true when the current user's POS role restricts them to a SINGLE section
 * (kitchen-only or waiter/orders-only).
 * These users have no sidebar navigation to other sections so they need an
 * explicit Logout button wherever they land.
 */
export function useSingleSectionRole() {
  const role = usePosRole();

  const isKitchenRole = role ? KITCHEN_ROLES.includes(role) : false;
  // "employee" without extra role → waiter sidebar by default (mirror SideNav logic)
  const isWaiterRole  = role ? (WAITER_ROLES.includes(role) || role === "employee") : false;

  return {
    role,
    isKitchenRole,
    isWaiterRole,
    /** true → user only has access to one section, needs an inline Logout */
    isSingleSectionRole: isKitchenRole || isWaiterRole,
  };
}
