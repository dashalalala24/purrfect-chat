export type TChatUser = {
  username: string;
  avatarSrc?: string;
};

export type TChatMessageType = 'incoming' | 'outgoing';

export type TChatMessage = {
  dateTime: string;
  text: string;
  attachments: unknown[];
  type: TChatMessageType;
};

export interface User {
  id?: number;
  first_name: string;
  second_name: string;
  display_name?: string;
  phone: string;
  login: string;
  avatar?: string;
  email: string;
}

export type TChat = {
  // id: number;
  // user: TChatUser;
  // messages: TChatMessage[];
  // unreadMessagesCount?: number;
  id?: number;
  title?: string;
  avatar?: string;
  unread_count?: number;
  created_by?: number;
  last_message?: {
    user?: User;
    time?: string;
    content?: string;
  } | null;
  isActive?: boolean;
};

export type TChatsPageContext = {
  chats: TChat[];
  selectedChat: TChat | null;
};
