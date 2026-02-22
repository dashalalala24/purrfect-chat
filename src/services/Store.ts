import EventBus from './EventBus';
import type { TChat } from '../types/chats';

export enum StoreEvents {
  Updated = 'Updated',
}

export type TUser = {
  id?: number;
  first_name: string;
  second_name: string;
  display_name?: string;
  phone: string;
  login: string;
  avatar?: string;
  email: string;
};

export type TActiveChat = {
  id?: number;
};

export type TSocketMessage = {
  id?: number;
  chat_id?: number;
  user_id?: number;
  content: string;
  time?: string;
};

export type TAppState = {
  user?: TUser;
  chats?: TChat[];
  token?: string;
  messages?: TSocketMessage[];
  activeChat?: TActiveChat;
};

type StoreEventMap = {
  [StoreEvents.Updated]: (prevState: TAppState, nextState: TAppState) => void;
};

class Store extends EventBus<StoreEventMap> {
  private static __instance: Store;
  private state: TAppState = {};

  constructor(defaultState: Partial<TAppState>) {
    if (Store.__instance) {
      return Store.__instance;
    }
    super();

    const storedState = sessionStorage.getItem('appState');
    this.state = storedState ? JSON.parse(storedState) : defaultState;
    this.set(this.state);

    Store.__instance = this;
  }

  public getState(): TAppState {
    return this.state;
  }

  public setUser(user: TUser) {
    this.set({ user });
  }

  public setChats(chats: TChat[]) {
    this.set({ chats });
  }

  public setMessages(messages: TSocketMessage[]) {
    this.set({ messages });
  }

  public clearMessages() {
    this.set({ messages: [] });
  }

  public setToken(token: string) {
    this.set({ token });
  }

  public setActiveChat(chatId: number) {
    const chats =
      this.state.chats?.map((chat) => ({
        ...chat,
        isActive: chat.id === chatId,
        unread_count: chat.id === chatId ? 0 : chat.unread_count,
      })) ?? [];
    const activeChat: TActiveChat = { id: chatId };
    this.set({ chats, activeChat });
  }

  public clearActiveChat() {
    const chats =
      this.state.chats?.map((chat) => ({
        ...chat,
        isActive: false,
      })) ?? [];
    this.set({ chats, activeChat: undefined });
  }

  public addMessage(message: TSocketMessage) {
    const oldMessages = store.getState().messages ?? [];
    const newMessages = [message, ...oldMessages];
    store.setMessages(newMessages);

    const currentChats = this.state.chats ?? [];
    if (currentChats.length === 0) {
      return;
    }

    const nextChats = currentChats.map((chat) => {
      if (!chat.isActive) {
        return chat;
      }

      return {
        ...chat,
        last_message: {
          ...(chat.last_message ?? {}),
          content: message.content,
          time: message.time,
        },
      };
    });

    this.set({ chats: nextChats });
  }

  private set(nextState: Partial<TAppState>) {
    const prevState = { ...this.state };
    this.state = { ...this.state, ...nextState };
    sessionStorage.setItem('appState', JSON.stringify(this.state));
    this.emit(StoreEvents.Updated, prevState, this.state);
  }
}

const store = new Store({});

export default store;
