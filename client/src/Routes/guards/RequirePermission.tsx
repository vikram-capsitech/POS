// src/routes/guards/RequirePermission.tsx
import React from "react";
import { Navigate, useParams } from "react-router-dom";

/**
 * EXPECTATION:
 * You should have a store/context that gives you permissions per org + global (superadmin).
 * Replace `useAccess()` with your real implementation.
 */

type ModuleKey =
  | "POS"
  | "HRM"
  | "CRM"
  | "INVENTORY"
  | "FINANCE"
  | "MAIN"
  | "SUPERADMIN";

type Props = {
  moduleKey: ModuleKey;
  // if true, require module access even when orgId is not present
  requireOrgId?: boolean;
  children: React.ReactNode;
};

import { useAuthStore } from "../../Store/store";

function useAccess() {
  const session = useAuthStore((s) => s.session);

  return {
    globalRole: session.role || "user",
    orgAccess: session.orgAccess || {},
  };
}

export default function RequirePermission({
  moduleKey,
  requireOrgId = false,
  children,
}: Props) {
  const { orgId } = useParams();
  const access = useAccess();
  // Superadmin: only allow access to SUPERADMIN-keyed routes.
  // Redirect away from any client/admin/POS routes.
  if (access.globalRole === "superadmin") {
    if (moduleKey === "SUPERADMIN") return <>{children}</>;
    return <Navigate to="/superadmin/organizations" replace />;
  }

  // If route requires orgId but missing
  if (requireOrgId && !orgId) {
    return <Navigate to="/client/organization" replace />;
  }

  // No orgId: allow for module landing pages like "/pos" (org selector)
  if (!orgId) return <>{children}</>;

  const org = access.orgAccess?.[orgId];
  const hasModule = Boolean(org?.modules?.includes(moduleKey));

  if (!hasModule) return <Navigate to="/403" replace />;

  return <>{children}</>;
}
