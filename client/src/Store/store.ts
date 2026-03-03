// src/Store/store.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { hrmListEmployees, getOrganizationById } from "../Api/index";

type Role = "superadmin" | "admin" | "employee" | string;

export type OrgAccess = {
  orgId: string;
  modules?: string[]; // ["POS","HRM","MAIN"]
  permissions?: string[]; // ["pos:access","pos:orders:read"]
  roleId?: string;
  roleName?: string;
  pages?: string[]; // ["task","sop","pos"] — page-level access from role
};

export type OrganizationSummary = {
  _id: string;
  name?: string;
  slug?: string;
  type?: string;
  logo?: string | null;
  theme?: { primary?: string };
  modules?: Record<string, boolean>;
  isActive?: boolean;
};

export type UserSession = {
  token: string | null;
  role: Role | null;
  userId: string | null;

  // your current app uses restaurantID - keep both for flexibility
  restaurantId: string | null;

  // module list (restaurantModules)
  modules: string[];

  // page-level access from the user's role (e.g. ["task","sop","pos"])
  // empty/null = admin/full access, no restriction
  pages: string[] | null;

  // org scoped access (recommended for guards)
  orgAccess: Record<string, OrgAccess>;

  // raw access array if backend sends it like that
  accessRaw: any[];

  // user profile (optional)
  email?: string | null;
  name?: string | null;
  refreshToken?: string | null;

  // ✅ org details (name/logo/theme/modules)
  organization?: OrganizationSummary | null;
};

type AuthStore = {
  session: UserSession;
  isLoggedIn: boolean;

  // actions
  setSessionFromLogin: (payload: any) => void;
  updateSession: (patch: Partial<UserSession>) => void;

  setOrgAccess: (orgAccess: Record<string, OrgAccess>) => void;
  clearSession: () => void;

  // org helpers
  setOrganization: (org: OrganizationSummary | null) => void;
  fetchOrganization: (orgId?: string) => Promise<void>;

  // helpers for guards
  hasModuleForOrg: (moduleKey: string, orgId?: string) => boolean;
  hasPermissionForOrg: (permKey: string, orgId?: string) => boolean;
};

const emptySession: UserSession = {
  token: null,
  role: null,
  userId: null,
  restaurantId: null,
  modules: [],
  pages: null,
  orgAccess: {},
  accessRaw: [],
  email: null,
  name: null,
  refreshToken: null,
  organization: null,
};

const normalizeModules = (modules: unknown): string[] => {
  if (Array.isArray(modules)) return modules.filter(Boolean).map(String);
  return [];
};

const orgObjToSummary = (org: any): OrganizationSummary | null => {
  if (!org || !org._id) return null;
  return {
    _id: String(org._id),
    name: org.name,
    slug: org.slug,
    type: org.type,
    logo: org.logo ?? null,
    theme: org.theme,
    modules: org.modules,
    isActive: org.isActive,
  };
};

// If backend sends `access` in any structure, normalize to orgAccess map if possible.
const normalizeOrgAccess = (payload: any): Record<string, OrgAccess> => {
  // 1) payload.orgAccess = [{orgId, modules, permissions}]
  if (Array.isArray(payload?.orgAccess)) {
    const map: Record<string, OrgAccess> = {};
    payload.orgAccess.forEach((x: any) => {
      if (!x?.orgId) return;
      map[String(x.orgId)] = {
        orgId: String(x.orgId),
        modules: normalizeModules(x.modules),
        permissions: normalizeModules(x.permissions),
        roleId: x.roleId ? String(x.roleId) : undefined,
        roleName: x.roleName ? String(x.roleName) : undefined,
      };
    });
    return map;
  }

  // 2) payload.access = [{orgId, modules, permissions}]
  if (Array.isArray(payload?.access)) {
    const map: Record<string, OrgAccess> = {};
    payload.access.forEach((x: any) => {
      const id = x?.orgId || x?.organizationId || x?.organizationID;
      if (!id) return;
      map[String(id)] = {
        orgId: String(id),
        modules: normalizeModules(x.modules),
        permissions: normalizeModules(x.permissions),
        roleId: x.roleId ? String(x.roleId) : undefined,
        roleName: x.roleName ? String(x.roleName) : undefined,
      };
    });
    return map;
  }

  return {};
};

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      session: emptySession,
      isLoggedIn: false,

      setOrganization: (org) => {
        set((s) => ({
          session: { ...s.session, organization: org },
        }));
      },

      fetchOrganization: async (orgId?: string) => {
        const id = orgId || get().session.restaurantId;
        debugger;
        if (!id) return;

        try {
          const res: any = await getOrganizationById(id);

          // Support both shapes:
          // 1) axios: res.data.data (or res.data.data.data)
          // 2) direct: res.data
          const org =
            res?.data?.data?.data ??
            res?.data?.data ??
            res?.data ??
            null;

          const summary = orgObjToSummary(org);
          if (summary) {
            set((s) => ({
              session: { ...s.session, organization: summary },
            }));
          }
        } catch (e) {
          // keep silent to avoid breaking login flow
          console.error("fetchOrganization failed", e);
        }
      },

      setSessionFromLogin: (payload: any) => {
        // backend: payload = { user, accessToken, refreshToken? }
        const user = payload?.user ?? null;

        const token: string | null = payload?.accessToken ?? payload?.token ?? null;
        const refreshToken: string | null = payload?.refreshToken ?? null;

        const role: Role | null = user?.systemRole ?? payload?.role ?? null;
        const userId: string | null = user?._id ?? payload?._id ?? payload?.userId ?? null;

        // organizationID can be object OR string
        const org = user?.organizationID ?? null;
        const orgId = typeof org === "string" ? org : org?._id;

        // Treat orgId as restaurantId
        const restaurantId: string | null =
          orgId ?? payload?.restaurantID ?? payload?.restaurantId ?? null;

        // modules from org.modules object
        const modulesObj = typeof org === "object" ? org?.modules : null;
        let modules: string[] = modulesObj
          ? Object.entries(modulesObj)
              .filter(([, v]) => Boolean(v))
              .map(([k]) => k.toUpperCase())
          : normalizeModules(payload?.modules);

        // Always include MAIN if there is an orgId
        if (orgId && !modules.includes("MAIN")) modules.push("MAIN");

        const orgAccess: Record<string, OrgAccess> = orgId
          ? {
              [String(orgId)]: {
                orgId: String(orgId),
                modules,
                permissions: normalizeModules(payload?.permissions),
                roleId: user?.roleID ? String(user.roleID) : undefined,
                roleName: undefined,
              },
            }
          : normalizeOrgAccess(payload);

        const accessRaw = Array.isArray(payload?.access) ? payload.access : [];

        const email: string | null = user?.email ?? payload?.email ?? null;
        const name: string | null = user?.displayName ?? user?.userName ?? payload?.name ?? null;

        // If org is already populated object (admin), store summary immediately.
        const organization = typeof org === "object" ? orgObjToSummary(org) : null;

        // pages from user.roleID (populated on login)
        // null = no restriction (admin / superadmin), [] or array = restricted
        const roleData = typeof user?.roleID === "object" ? user.roleID : null;
        const pages: string[] | null =
          role === "admin" || role === "superadmin"
            ? null  // admins see everything
            : Array.isArray(roleData?.pages)
              ? roleData.pages
              : null;

        set({
          session: {
            ...get().session,
            token,
            refreshToken,
            role,
            userId,
            restaurantId,
            modules,
            pages,
            orgAccess,
            accessRaw,
            email,
            name,
            organization,
          },
          isLoggedIn: Boolean(token),
        });
        debugger;
        // If org is only ID string (employee), fetch details in background
        if (!organization && orgId) {
          // fire-and-forget (no await)
          get().fetchOrganization(String(orgId));
        }
      },

      updateSession: (patch) => {
        set((s) => ({
          session: { ...s.session, ...patch },
        }));
      },

      setOrgAccess: (orgAccess) => {
        set((s) => ({
          session: { ...s.session, orgAccess },
        }));
      },

      clearSession: () => {
        set({ session: emptySession, isLoggedIn: false });
      },

      hasModuleForOrg: (moduleKey, orgId) => {
        const { session } = get();
        if (!session.token) return false;

        if (session.role === "superadmin") return true;

        if (!orgId) return session.modules.includes(moduleKey);

        const org = session.orgAccess?.[orgId];
        return Boolean(org?.modules?.includes(moduleKey));
      },

      hasPermissionForOrg: (permKey, orgId) => {
        const { session } = get();
        if (!session.token) return false;

        if (session.role === "superadmin") return true;

        if (!orgId) return false;

        const org = session.orgAccess?.[orgId];
        return Boolean(org?.permissions?.includes(permKey));
      },
    }),
    {
      name: "auth-store",
      partialize: (s) => ({
        session: s.session,
        isLoggedIn: s.isLoggedIn,
      }),
    }
  )
);

// ---------------- Employee Store ----------------

type EmployeeStore = {
  employees: any[];
  fetchEmployees: () => Promise<void>;
};

export const useEmployeeStore = create<EmployeeStore>((set) => ({
  employees: [],
  fetchEmployees: async () => {
    try {
      const response: any = await hrmListEmployees();
      const data =
        response?.data?.employees ??
        response?.data?.data?.employees ??
        response?.data ??
        [];
      set({ employees: Array.isArray(data) ? data : [] });
    } catch (error) {
      console.error("Failed to fetch employees", error);
    }
  },
}));