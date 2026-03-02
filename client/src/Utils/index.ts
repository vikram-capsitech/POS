// Importing necessary modules and interfaces
import { AxiosResponse } from "axios";
import { APISuccessResponseInterface } from "../Interfaces/api";
import { ChatListItemInterface } from "../Interfaces/chat";
import { UserInterface } from "../Interfaces/user";

// A utility function for handling API requests with loading, success, and error handling
export const requestHandler = async (
  api: () => Promise<AxiosResponse<APISuccessResponseInterface, any>>,
  setLoading: ((loading: boolean) => void) | null,
  onSuccess: (data: APISuccessResponseInterface) => void,
  onError: (error: string) => void
) => {
  setLoading && setLoading(true);
  try {
    // Make the API request
    const response = await api();
    const { data } = response;
    if (data?.success) {
      onSuccess(data);
    }
  } catch (error: any) {
    if ([401, 403].includes(error?.response.data?.statusCode)) {
      localStorage.clear(); // Clear local storage on authentication issues
      if (isBrowser) window.location.href = "/auth/login"; // Redirect to login page
    }
    onError(error?.response?.data?.message || "Something went wrong");
  } finally {
    setLoading && setLoading(false);
  }
};

// A utility function to concatenate CSS class names with proper spacing
export const classNames = (...className: string[]) => {
  return className.filter(Boolean).join(" ");
};

export const isBrowser = typeof window !== "undefined";

export const isUserActive = (
  chat: ChatListItemInterface,
  user: UserInterface, // The chat item for which metadata is being generated.
  activeUsers: any[] // The currently logged-in user details.
) => {
  if (!chat?.isGroupChat) {
    const participant = chat?.participants?.find((p) => p._id !== user._id);
    // Check if the participant is active in the activeUsers array
    if (participant) {
      // Check if the participant's userId exists in activeUsers
      return activeUsers?.some((a) => a.userId === participant._id);
    } else {
      return false;
    }
  }

  return false; // If it's a group chat or no active user is found
};

// This utility function generates metadata for chat objects.
// It takes into consideration both group chats and individual chats.
export const getChatObjectMetadata = (
  chat: ChatListItemInterface, // The chat item for which metadata is being generated.
  loggedInUser: UserInterface // The currently logged-in user details.
) => {
  // Determine the content of the last message, if any.
  // If the last message contains only attachments, indicate their count.
  let lastMessage = " ";

  if (chat.lastMessage) {
    if (chat.lastMessage.deleted) {
      lastMessage = "This message was deleted";
    } else if (chat.lastMessage.forwardTo && !chat.lastMessage.content) {
      lastMessage = "Forwarded Message";
    } else if (
      chat.lastMessage.content &&
      chat.lastMessage.content.trim().length > 0
    ) {
      lastMessage = chat.lastMessage.content;
    } else if (
      (!chat.lastMessage.content || chat.lastMessage.content.trim() === "") &&
      Array.isArray(chat.lastMessage.attachments) &&
      chat.lastMessage.attachments.length > 0
    ) {
      lastMessage = `${chat.lastMessage.attachments.length} attachment${
        chat.lastMessage.attachments.length > 1 ? "s" : ""
      }`;
    } else {
      lastMessage = "";
    }
  }

  if (chat.isGroupChat) {
    // Case: Group chat
    // Return metadata specific to group chats.
    return {
      // Default avatar for group chats.
      avatar: "https://via.placeholder.com/100x100.png",
      title: chat.name, // Group name serves as the title.
      description: `${chat.participants.length} members in the chat`, // Description indicates the number of members.
      lastMessage: chat.lastMessage?.sender?.userName
        ? `${chat.lastMessage.sender.userName}: ${lastMessage}`
        : lastMessage,
    };
  } else {
    // Case: Individual chat
    // Identify the participant other than the logged-in user.
    const participant = chat.participants.find(
      (p) => p._id !== loggedInUser?._id
    );
    // Return metadata specific to individual chats.
    return {
      avatar: participant?.pic, // Participant's avatar URL.
      title: participant?.userName, // Participant's username serves as the title.
      description: participant?.email, // Email address of the participant.
      lastMessage,
    };
  }
};

export const isUserActicve = (
  chat: ChatListItemInterface, // The chat item for which metadata is being generated.
  loggedInUser: UserInterface // The currently logged-in user details.
) => {
  // Determine the content of the last message, if any.
  // If the last message contains only attachments, indicate their count.
  const lastMessage = chat.lastMessage?.content
    ? chat.lastMessage?.content
    : chat.lastMessage
    ? `${chat.lastMessage?.attachments?.length} attachment${
        chat.lastMessage.attachments?.length > 1 ? "s" : ""
      }`
    : " "; // Placeholder text if there are no messages.

  if (chat.isGroupChat) {
    // Case: Group chat
    // Return metadata specific to group chats.
    return {
      // Default avatar for group chats.
      avatar: "https://via.placeholder.com/100x100.png",
      title: chat.name, // Group name serves as the title.
      description: `${chat.participants.length} members in the chat`, // Description indicates the number of members.
      lastMessage: chat.lastMessage
        ? chat.lastMessage?.sender?.userName + ": " + lastMessage
        : lastMessage,
    };
  } else {
    // Case: Individual chat
    // Identify the participant other than the logged-in user.
    const participant = chat.participants.find(
      (p) => p._id !== loggedInUser?._id
    );
    // Return metadata specific to individual chats.
    return {
      avatar: participant?.pic, // Participant's avatar URL.
      title: participant?.userName, // Participant's username serves as the title.
      description: participant?.email, // Email address of the participant.
      lastMessage,
    };
  }
};

// A class that provides utility functions for working with local storage
export class LocalStorage {
  // Get a value from local storage by key
  static get(key: string) {
    if (!isBrowser) return;
    const value = localStorage.getItem(key);
    if (value) {
      try {
        return JSON.parse(value);
      } catch (err) {
        return null;
      }
    }
    return null;
  }

  // Set a value in local storage by key
  static set(key: string, value: any) {
    if (!isBrowser) return;
    localStorage.setItem(key, JSON.stringify(value));
  }

  // Remove a value from local storage by key
  static remove(key: string) {
    if (!isBrowser) return;
    localStorage.removeItem(key);
  }

  // Clear all items from local storage
  static clear() {
    if (!isBrowser) return;
    localStorage.clear();
  }
}

export const iconPDF =
  "https://cdn4.iconfinder.com/data/icons/logos-and-brands/512/27_Pdf_File_Type_Adobe_logo_logos-512.png";
