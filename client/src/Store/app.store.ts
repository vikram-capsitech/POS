// src/store/app.store.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";

export enum TabType {
  DEFAULT = "DEFAULT",
  POS = "POS",
  TASK = "TASK",
  ISSUE = "ISSUE",
  REQUEST = "REQUEST",
  ATTENDANCE = "ATTENDANCE",
  VOUCHER = "VOUCHER",
  SOP = "SOP",
  AI_REVIEW = "AI_REVIEW",
  SALARY_MANAGEMENT = "SALARY_MANAGEMENT",
  ACTIVITY_LOGS = "ACTIVITY_LOGS",
  NOTIFICATIONS = "NOTIFICATIONS",
  SETTINGS = "SETTINGS",
  CHECKIN = "CHECKIN",
  PAYMENTS = "PAYMENTS",
}

type SnackbarState = { open: boolean | null; severity: string | null; message: string | null };

type AppState = {
  tab: TabType;
  snackbar: SnackbarState;
  updateTab: (tab: TabType) => void;

  openSnackBar: (severity: string, message: string) => void;
  closeSnackBar: () => void;

  showSnackbar: (severity: string, message: string, ms?: number) => void;
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      tab: TabType.DEFAULT,
      snackbar: { open: null, severity: null, message: null },

      updateTab: (tab) =>
        set(() => ({
          tab,
        })),

      openSnackBar: (severity, message) =>
        set(() => ({
          snackbar: { open: true, severity, message },
        })),

      closeSnackBar: () =>
        set(() => ({
          snackbar: { open: false, severity: null, message: null },
        })),

      showSnackbar: (severity, message, ms = 4000) => {
        get().openSnackBar(severity, message);
        window.setTimeout(() => get().closeSnackBar(), ms);
      },
    }),
    {
      name: "app-store",
      partialize: (s) => ({
        tab: s.tab,
      }),
    }
  )
);