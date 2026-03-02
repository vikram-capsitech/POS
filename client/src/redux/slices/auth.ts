import { createSlice, Dispatch } from "@reduxjs/toolkit";
import { showSnackbar } from "./app";
import { requestHandler } from "../../Utils";
import {
  fetchUserStatus,
  loginUser,
  registerUser,
  sendotpToMail,
  updateUserStatus,
  verifyEmail,
} from "../../Api";
import {
  BugInterface,
  DiscussionInterface,
  UserInterface,
} from "../../Interfaces/user";
import { toast } from "react-toastify";

//----------------------------------------------------------------------

export interface AuthInitialState {
  isLoggedIn: boolean;
  token: string;
  isLoading: boolean;
  user: UserInterface | null;
  error: boolean;
  organizations: any[];
  currentOrganization: any;
  userStatuses: { [key: string]: any };
  bugList: BugInterface[];
  discussions: DiscussionInterface[];
}

const initialState: AuthInitialState = {
  isLoggedIn: false,
  token: "",
  isLoading: false,
  user: null,
  error: false,
  organizations: [],
  currentOrganization: null,
  userStatuses: {},
  bugList: [],
  discussions: [],
};

const slice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    updateIsLoading(state, action) {
      state.error = action.payload.error;
      state.isLoading = action.payload.isLoading;
    },
    logIn(state, action) {
      state.isLoggedIn = action.payload.isLoggedIn;
      state.token = action.payload.token;
      state.user = action.payload.user;
      state.organizations = action.payload.organizations;
    },
    registerUserDetail(state, action) {
      state.isLoggedIn = action.payload.isLoggedIn;
      state.token = action.payload.token;
      state.user = action.payload.user;
    },
    signOut(state?: any) {
      state.isLoggedIn = false;
      state.token = "";
      state.user = null;
      state.isLoading = false;
      state.currentOrganization = null;
      state.organizations = [];
    },
    updateUser(state, action) {
      state.user = action.payload.user;
    },
    updateUserStatus(state, action) {
      if (state.user) {
        state.user.userStatus = action.payload.status;
      }
    },
    fetchUserStatus(state, action) {
      const { userId, status } = action.payload;
      state.userStatuses[userId] = status;
    },
    setOrgList(state, action) {
      state.isLoading = action.payload.isLoading;
      state.organizations = action.payload.organizations;
    },
    setOrg(state, action) {
      state.isLoading = action.payload.isLoading;
      state.currentOrganization = action.payload.currentOrganization;
    },
    verifyEmail(state, action) {
      state.isLoggedIn = action.payload.isLoggedIn;
      state.token = action.payload.token;
      state.user = action.payload.user;
      state.organizations = action.payload.organizations ?? [];
    },
    updateWorkSpaceProfile(state, action) {
      state.currentOrganization = action.payload.currentOrganization;
    },
    setBug(state, action) {
      state.isLoading = action.payload.isLoading;
      state.bugList = action.payload.bugList;
    },
    setDiscussion(state, action) {
      state.isLoading = action.payload.isLoading;
      state.discussions = action.payload.discussions;
    },
  },
});

// Reducer
export default slice.reducer;

export function LoginUser(formValues: any) {
  return async (dispatch: any) => {
    // Make API call here
    await requestHandler(
      async () => await loginUser(formValues),
      () => {
        dispatch(
          slice.actions.updateIsLoading({ isLoading: true, error: false })
        );
      },
      (res) => {
        if (res.success) {
          const { data } = res;
          dispatch(
            slice.actions.logIn({
              isLoggedIn: true,
              token: data.accessToken,
              user: data.user,
              organizations: data.organizations ?? [],
            })
          );
          dispatch(
            showSnackbar({ severity: "success", message: res.data.message })
          );
          dispatch(
            slice.actions.updateIsLoading({ isLoading: false, error: false })
          );
        } else {
          dispatch(showSnackbar({ severity: "error", message: res.message }));
          dispatch(
            slice.actions.updateIsLoading({ isLoading: false, error: true })
          );
        }
      },
      (error: any) => {
        dispatch(
          slice.actions.updateIsLoading({ isLoading: false, error: true })
        );
        dispatch(showSnackbar({ severity: "error", message: error }));
      }
    );
  };
}

export function RegisterUser(formValues: any) {
  return async (dispatch: any) => {
    // Make API call here
    await requestHandler(
      async () => await registerUser(formValues),
      () => {
        dispatch(
          slice.actions.updateIsLoading({ isLoading: true, error: false })
        );
      },
      (res) => {
        if (res.success) {
          const { data } = res;
          dispatch(
            slice.actions.registerUserDetail({
              isLoggedIn: true,
              token: data.accessToken,
              user: data.user,
              organizations: data.organizations ?? [],
            })
          );
          toast.success("Registered Successfully!");
          // dispatch(
          //   showSnackbar({ severity: "success", message: res.data.message })
          // );
          dispatch(
            slice.actions.updateIsLoading({ isLoading: false, error: false })
          );
        } else {
          toast.error("No workspaces found for the given email.");
          // dispatch(showSnackbar({ severity: "error", message: res.message }));
          dispatch(
            slice.actions.updateIsLoading({ isLoading: false, error: true })
          );
        }
      },
      () => {
        dispatch(
          slice.actions.updateIsLoading({ isLoading: false, error: true })
        );
        // dispatch(showSnackbar({ severity: "error", message: error }));
        toast.error("No workspaces found for the given email.");
      }
    );
  };
}

export function LogoutUser() {
  return async (dispatch: any) => {
    window.localStorage.removeItem("user");
    window.localStorage.removeItem("currentOrganization");
    dispatch(slice.actions.signOut());
  };
}

export function UpdateUserProfile(userData: any) {
  return async (dispatch: any) => {
    dispatch(
      slice.actions.updateUser({
        user: userData,
      })
    );
  };
}

export function FetchUserStatus(userIds: string[]) {
  return async (dispatch: any) => {
    if (!userIds.length) return;
    console.log("Fetching statuses for users:", userIds);
    try {
      const response = await fetchUserStatus(userIds);
      if (!response?.data?.statuses) {
        throw new Error("Invalid response from API");
      }
      const statusMap = response.data.statuses;
      dispatch(slice.actions.fetchUserStatus(statusMap));
      console.log("Updated user statuses:", statusMap);
    } catch (error) {
      console.error("Error fetching user statuses:", error);
      dispatch(
        showSnackbar({
          severity: "error",
          message: "Failed to fetch user statuses.",
        })
      );
    }
  };
}

export function ChangeUserStatus(status: string) {
  return async (dispatch: any, getState: any) => {
    const { user } = getState().auth;

    if (!user?._id) {
      console.error("User ID is missing");
      return;
    }

    await requestHandler(
      async () => await updateUserStatus(status, user._id),
      () => {
        dispatch(
          slice.actions.updateIsLoading({ isLoading: true, error: false })
        );
      },
      (data: any) => {
        console.log("API Response:", data);

        const newStatus = data?.data?.status;

        if (!newStatus) {
          console.error("API did not return a valid status!");
          return;
        }

        dispatch(
          slice.actions.updateUserStatus({
            status: newStatus,
          })
        );
      },
      (error) => {
        console.error("Error updating user status", error);
        dispatch(
          showSnackbar({
            severity: "error",
            message: "Failed to update user status. Please try again.",
          })
        );
        dispatch(
          slice.actions.updateIsLoading({ isLoading: false, error: true })
        );
      }
    );
  };
}

export function updateOrgList(values: any) {
  return async (dispatch: any) => {
    dispatch(
      slice.actions.setOrgList({
        organizations: values,
        isLoading: false,
      })
    );
  };
}

export function setCurrentOrg(org: any) {
  return async (dispatch: any) => {
    dispatch(
      slice.actions.setOrg({
        currentOrganization: org,
        isLoading: false,
      })
    );
  };
}

export function verifyUser(val: any) {
  return async (dispatch: any) => {
    dispatch(
      slice.actions.logIn({
        isLoggedIn: true,
        token: val.data.accessToken,
        user: val.data.user,
        organizations: val.data.organizations ?? [],
      })
    );
  };
}
export function SendOtpToMail(formValues: any) {
  return async (dispatch: any) => {
    await requestHandler(
      async () => await sendotpToMail(formValues),
      () => {
        dispatch(
          slice.actions.updateIsLoading({ isLoading: true, error: false })
        );
      },
      (res) => {
        if (res.success) {
          // dispatch(
          //   showSnackbar({
          //     severity: "success",
          //     message: res.message || "OTP sent successfully!",
          //   })
          // );
        } else {
          dispatch(
            showSnackbar({
              severity: "error",
              message: res.message || "Failed to send OTP.",
            })
          );
        }
        dispatch(
          slice.actions.updateIsLoading({ isLoading: false, error: false })
        );
      },
      (error: any) => {
        dispatch(
          slice.actions.updateIsLoading({ isLoading: false, error: true })
        );
        dispatch(
          showSnackbar({
            severity: "error",
            message: error || "Error sending OTP.",
          })
        );
      }
    );
  };
}

export function UpdateWorkSpaceProfile(workspaceData: any) {
  return async (dispatch: any) => {
    dispatch(
      slice.actions.updateWorkSpaceProfile({
        currentOrganization: workspaceData,
      })
    );
  };
}

export function VerifyEmail(payload: { email: string; otp: string }) {
  return async (dispatch: any) => {
    await requestHandler(
      async () => await verifyEmail(payload),
      () => {
        dispatch(
          slice.actions.updateIsLoading({ isLoading: true, error: false })
        );
      },
      (res) => {
        const { data } = res;
        console.log("API Response:", data);
        if (res.success) {
          dispatch(
            slice.actions.verifyEmail({
              isLoggedIn: true,
              token: data.accessToken,
              user: data.user,
              organizations: data.organizations ?? [],
            })
          );
        } else {
          dispatch(
            showSnackbar({
              severity: "error",
              message: res.message || "OTP verification failed.",
            })
          );
        }
        dispatch(
          slice.actions.updateIsLoading({ isLoading: false, error: false })
        );
      },
      (error: any) => {
        dispatch(
          slice.actions.updateIsLoading({ isLoading: false, error: true })
        );
        dispatch(
          showSnackbar({
            severity: "error",
            message:
              error?.response?.data?.message ||
              "OTP verification failed. Please try again.",
          })
        );
      }
    );
  };
}

export function setBugList(buglist: any) {
  return async (dispatch: Dispatch) => {
    dispatch(
      slice.actions.setBug({
        bugList: buglist,
        isLoading: false,
      })
    );
  };
}

export function setDiscussionsList(discussions: any) {
  return async (dispatch: Dispatch) => {
    dispatch(
      slice.actions.setDiscussion({
        discussions: discussions,
        isLoading: false,
      })
    );
  };
}
