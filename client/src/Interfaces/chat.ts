import { UserInterface } from "./user";

export interface ChatListItemInterface {
  admin: string;
  createdAt: string;
  isGroupChat: true;
  lastMessage?: ChatMessageInterface;
  isPrivateGroup?: boolean;
  name: string;
  participants: UserInterface[];
  updatedAt: string;
  _id: string;
  logo?: string;
  membersCount: number;
}

export interface ChatMessageInterface {
  _id: string;
  sender: Pick<UserInterface, "_id" | "pic" | "email" | "userName">;
  content: string;
  chatId: string;
  attachments: {
    fileName: string;
    fileType: string;
    size: number;
    url: string;
    localPath: string;
    _id: string;
  }[];
  createdAt: string;
  updatedAt: string;
  pauseNotification: boolean;
  deleted: boolean;
  edited: boolean;
  reactions: {
    userId: string;
    emoji: string;
  }[];
  replyTo: string;
  forwardTo: string;
  type: number;
  timestamp: string;
  isPinned: boolean
}
