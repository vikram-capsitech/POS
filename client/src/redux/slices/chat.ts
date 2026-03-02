import { Dispatch, createSlice } from "@reduxjs/toolkit";
import { getActiveUsers, getUserChats } from "../../Api";
import { requestHandler } from "../../Utils";
import {
  ChatListItemInterface,
  ChatMessageInterface,
} from "../../Interfaces/chat";
import { showSnackbar } from "../slices/app";

interface ChatState {
  notification: [];
  chats: ChatListItemInterface[];
  currentChat: null;
  groups: any[];
  error: undefined;
  isLoading: false;
  messages: ChatMessageInterface[];
  unreadMessages: [];
  newMembers: [];
  activeUsers: [];
  pauseNotification: false;
  highlightedMessage: {
    id: string | null;
    timestamp: number;
  };
}

const initialState: ChatState = {
  notification: [],
  chats: [],
  currentChat: null,
  groups: <any>[],
  error: undefined,
  isLoading: false,
  messages: [],
  unreadMessages: [],
  newMembers: [],
  activeUsers: [],
  pauseNotification: false,
  highlightedMessage: {
    id: null,
    timestamp: 0,
  },
};

const slice = createSlice({
  name: "app",
  initialState,
  reducers: {
    updateIsLoading(state, action) {
      state.error = action.payload.error;
      state.isLoading = action.payload.isLoading;
    },
    fetchChats(state, action) {
      state.error = action.payload.error;
      state.isLoading = action.payload.isLoading;
      state.chats = action.payload.chats;
      state.groups = action.payload.groups;
    },
    selectedChat(state, action) {
      state.isLoading = action.payload.isLoading;
      state.chats = action.payload.chats;
    },
    currentChat(state, action) {
      state.isLoading = action.payload.isLoading;
      state.currentChat = action.payload.currentChat;
    },
    setUnreadMessages(state, action) {
      state.isLoading = action.payload.isLoading;
      state.unreadMessages = action.payload.unreadMessages;
    },
    setMessages(state, action) {
      state.isLoading = action.payload.isLoading;
      state.messages = action.payload.messages;
    },
    setActiveUsers(state, action) {
      state.activeUsers = action.payload.activeUsers;
    },
    setNewMembers(state, action) {
      state.isLoading = action.payload.isLoading;
      state.newMembers = action.payload.newMembers;
    },
    updateGroup(state, action) {
      state.isLoading = action.payload.isLoading;
      state.currentChat = action?.payload?.updateGroup;
      state.groups = state?.groups?.map((item: any) => {
        if (item?._id == action?.payload?.updateGroup?._id) {
          return {
            ...item,
            ...action?.payload?.updateGroup,
          };
        }
        return item;
      });
    },
    createNewGroup(state, action) {
      state.isLoading = action.payload.isLoading;
      state.currentChat = action?.payload?.group;
      state.groups = [...state.groups, action.payload.group];
    },
    setPauseNotification(state, action) {
      state.pauseNotification = action.payload;
    },
    highlightMessage(state, action) {
      state.highlightedMessage = {
        id: action.payload,
        timestamp: Date.now(),
      };
    },
    clearHighlight(state) {
      state.highlightedMessage = {
        id: null,
        timestamp: 0,
      };
    },
  },
});

// Reducer
export default slice.reducer;

export function FetchChats(orgId: string) {
  return async (dispatch: Dispatch) => {
    dispatch(slice.actions.updateIsLoading({ isLoading: true, error: false }));
    await requestHandler(
      async () => await getUserChats(orgId),
      null,
      (res) => {
        const { data } = res;
        dispatch(
          slice.actions.fetchChats({
            isLoading: false,
            chats: data.filter((i: ChatListItemInterface) => !i.isGroupChat),
            groups: data.filter((i: ChatListItemInterface) => i.isGroupChat),
            error: undefined,
          })
        );
        dispatch(
          slice.actions.updateIsLoading({ isLoading: false, error: false })
        );
      },
      (error: string) => {
        dispatch(showSnackbar({ severity: "error", message: error }) as any);
      }
    );
  };
}

export function GetActiveUsers() {
  return async (dispatch: Dispatch) => {
    await requestHandler(
      async () => await getActiveUsers(),
      null,
      (res) => {
        const { data } = res;
        dispatch(
          slice.actions.setActiveUsers({
            activeUsers: data.activeUsers,
          })
        );
      },
      (error: string) => {
        dispatch(showSnackbar({ severity: "error", message: error }) as any);
      }
    );
  };
}

export function SetChats(chat: any) {
  return async (dispatch: Dispatch) => {
    //Set Loader visible
    dispatch(slice.actions.updateIsLoading({ isLoading: true, error: false }));
    //Update Chats content
    dispatch(
      slice.actions.selectedChat({
        isLoading: false,
        chats: chat,
      })
    );
  };
}

export function setCurrentChat(chat: any) {
  return async (dispatch: Dispatch) => {
    //Set Loader visible
    dispatch(slice.actions.updateIsLoading({ isLoading: true, error: false }));
    //Update Chats content
    dispatch(
      slice.actions.currentChat({
        isLoading: false,
        currentChat: chat,
      })
    );
  };
}

export function updateUnreadMessages(msg: ChatMessageInterface[]) {
  return async (dispatch: Dispatch) => {
    //Set Loader visible
    dispatch(slice.actions.updateIsLoading({ isLoading: true, error: false }));
    //Update unreadMessages
    dispatch(
      slice.actions.setUnreadMessages({
        isLoading: false,
        unreadMessages: msg,
      })
    );
  };
}

export function updateMessages(msg: ChatMessageInterface[]) {
  return async (dispatch: Dispatch) => {
    //Set Loader visible
    dispatch(slice.actions.updateIsLoading({ isLoading: true, error: false }));
    //Update messages
    dispatch(
      slice.actions.setMessages({
        isLoading: false,
        messages: msg,
      })
    );
  };
}

export function addNewMembers(member: any) {
  console.log(member, "these are new members");
  return async (dispatch: Dispatch) => {
    //Set Loader visible
    dispatch(slice.actions.updateIsLoading({ isLoading: true, error: false }));
    //add members
    dispatch(
      slice.actions.setNewMembers({
        isLoading: false,
        newMembers: member,
      })
    );
  };
}

export function createNewGroupChat(group: any) {
  return async (dispatch: Dispatch) => {
    dispatch(slice.actions.updateIsLoading({ isLoading: true, error: false }));
    dispatch(
      slice.actions.createNewGroup({
        isLoading: false,
        group: group,
      })
    );
  };
}

export function updateGroupChatDetails(updateGroupDetails: any) {
  return async (dispatch: Dispatch) => {
    dispatch(slice.actions.updateIsLoading({ isLoading: true, error: false }));
    dispatch(
      slice.actions.updateGroup({
        isLoading: false,
        updateGroup: updateGroupDetails,
      })
    );
  };
}

export function setPauseNotification(status: boolean) {
  return (dispatch: Dispatch) => {
    dispatch(slice.actions.setPauseNotification(status));
  };
}

export const { highlightMessage, clearHighlight } = slice.actions;
