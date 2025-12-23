export type TChatUser = {
  username: string;
  avatarSrc?: string;
};

export type TChatMessageType = 'incoming' | 'outgoing';

export type TChatMessage = {
  dateTime: string;
  text: string;
  attachments: any[];
  type: TChatMessageType;
};

export type TChat = {
  id: string;
  user: TChatUser;
  messages: TChatMessage[];
  unreadMessagesCount?: number;
};

export type TChatsPageContext = {
  chats: TChat[];
  selectedChat: TChat | null;
};
