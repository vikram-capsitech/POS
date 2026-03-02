import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export enum SideBarType {
  PROFILE = "PROFILE",
  GROUP = "GROUP",
  PIN = "PIN",
  BUG = "BUG",
}

export enum TabType {
  DEFAULT,
  DM,
  CHANNELS,
  BUG,
}

interface SideBarState {
  open: boolean;
  type: SideBarType;
}

interface SnackbarState {
  open: boolean | null;
  severity: string | null;
  message: string | null;
}

interface InitialState {
  sideBar: SideBarState;
  isLoggedIn: boolean;
  tab: TabType;
  snackbar: SnackbarState;
}

const initialState: InitialState = {
  sideBar: {
    open: false,
    type: SideBarType.PROFILE,
  },
  isLoggedIn: true,
  tab: TabType.DEFAULT,
  snackbar: {
    open: null,
    severity: null,
    message: null,
  },
};

const slice = createSlice({
  name: "app",
  initialState,
  reducers: {
    updateSideBar(
      state,
      action: PayloadAction<{ type: SideBarType; open: boolean }>
    ) {
      state.sideBar.type = action.payload.type;
      state.sideBar.open = action.payload.open;
    },
    updateTab(state, action: PayloadAction<{ tab: TabType }>) {
      state.tab = action.payload.tab;
      state.sideBar.open = false;
    },
    openSnackBar(
      state,
      action: PayloadAction<{ severity: string; message: string }>
    ) {
      state.snackbar.open = true;
      state.snackbar.severity = action.payload.severity;
      state.snackbar.message = action.payload.message;
    },
    closeSnackBar(state) {
      state.snackbar.open = false;
      state.snackbar.message = null;
    },
  },
});

export default slice.reducer;

export const closeSnackBar = () => async (dispatch: any) => {
  dispatch(slice.actions.closeSnackBar());
};

export const showSnackbar =
  ({ severity, message }: { severity: string; message: string }) =>
  async (dispatch: any) => {
    dispatch(slice.actions.openSnackBar({ severity, message }));

    setTimeout(() => {
      dispatch(slice.actions.closeSnackBar());
    }, 4000);
  };

export const ToggleSidebar =
  (type: SideBarType, open: boolean) => async (dispatch: any) => {
    dispatch(slice.actions.updateSideBar({ type, open }));
  };

export const UpdateTab = (tab: TabType) => async (dispatch: any) => {
  dispatch(slice.actions.updateTab({ tab }));
};
