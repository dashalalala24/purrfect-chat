import { ChatApi } from '../api/chatApi';
import { HttpStatus } from '../consts/httpStatus';
import handleControllerError from '../services/handleControllerError';
import store from '../services/Store';
import toast from '../services/Toast';

type TFoundUser = {
  id: number;
  login: string;
  first_name?: string;
  second_name?: string;
  display_name?: string | null;
  avatar?: string | null;
};

class ChatController {
  private static getActiveChatId(): number | null {
    const state = store.getState();
    const chatId = state.chats?.find((chat) => chat.isActive)?.id ?? state.activeChat?.id;
    return typeof chatId === 'number' ? chatId : null;
  }

  private static getUserIdByExactLogin(users: unknown, login: string): number | null {
    if (!Array.isArray(users)) {
      return null;
    }

    const normalizedLogin = login.trim();
    const matchedUser = (users as TFoundUser[]).find((user) => user.login === normalizedLogin);

    if (!matchedUser) {
      return null;
    }

    return matchedUser.id;
  }

  public static async searchUsers(login: string): Promise<TFoundUser[]> {
    try {
      const xhr = await ChatApi.getUserByLogin({ login });

      if (xhr.status !== HttpStatus.Ok) {
        throw xhr;
      }

      const userData = JSON.parse(xhr.responseText);
      if (!Array.isArray(userData)) {
        return [];
      }

      return userData.filter(
        (user): user is TFoundUser => typeof user?.id === 'number' && typeof user?.login === 'string'
      );
    } catch (xhr) {
      handleControllerError(xhr, 'Error during searching users');
      return [];
    }
  }

  public static async createNewChat(data: Record<string, unknown>) {
    try {
      const xhr = await ChatApi.createNewChat(data);

      if (xhr.status === HttpStatus.Ok) {
        toast.success('New chat created successfully');
        await this.getChats();
      } else {
        throw xhr;
      }
    } catch (xhr) {
      handleControllerError(xhr, 'Error during creating chat');
    }
  }

  public static async getChats() {
    try {
      const activeChatId = this.getActiveChatId();
      const xhr = await ChatApi.getAllChats();

      if (xhr.status !== HttpStatus.Ok) {
        throw xhr;
      }

      let allChatsData: unknown;

      try {
        allChatsData = JSON.parse(xhr.responseText);
      } catch (error) {
        console.error('Failed to parse chats payload', error);
        return;
      }

      if (!Array.isArray(allChatsData)) {
        console.error('Chats payload has unexpected format', allChatsData);
        return;
      }

      const chatsWithActivity = allChatsData.map((chat) => {
        const chatRecord = chat as Record<string, unknown>;
        const chatId = typeof chatRecord.id === 'number' ? chatRecord.id : null;

        return {
          ...chatRecord,
          isActive: chatId !== null && chatId === activeChatId,
        };
      });

      try {
        store.setChats(chatsWithActivity);
      } catch (error) {
        console.error('Failed to update chats in store', error);
        return;
      }
    } catch (xhr) {
      handleControllerError(xhr, 'Error during downloading all chats data');
    }
  }

  public static async addUser(data: Record<string, unknown>) {
    try {
      let userId = typeof data.userId === 'number' ? data.userId : null;

      if (userId === null) {
        const xhr = await ChatApi.getUserByLogin(data);

        if (xhr.status !== HttpStatus.Ok) {
          throw xhr;
        }

        const userData = JSON.parse(xhr.responseText);
        const login = typeof data.login === 'string' ? data.login : '';
        userId = this.getUserIdByExactLogin(userData, login);
      }

      const chatId = this.getActiveChatId();

      if (chatId !== null && userId !== null) {
        await ChatApi.addUserToChat({ users: [userId], chatId });

        toast.success('User added to the chat');
      } else if (userId === null) {
        toast.error('User with this exact login was not found');
      } else {
        toast.error('Active chat ID is undefined');
      }
    } catch (xhr) {
      handleControllerError(xhr, 'Error during adding user to the chat');
    }
  }

  public static async deleteUser(data: Record<string, unknown>) {
    try {
      let userId = typeof data.userId === 'number' ? data.userId : null;

      if (userId === null) {
        const xhr = await ChatApi.getUserByLogin(data);

        if (xhr.status !== HttpStatus.Ok) {
          throw xhr;
        }

        const userData = JSON.parse(xhr.responseText);
        const login = typeof data.login === 'string' ? data.login : '';
        userId = this.getUserIdByExactLogin(userData, login);
      }

      const chatId = this.getActiveChatId();

      if (chatId !== null && userId !== null) {
        const xhr = await ChatApi.deleteUserFromChat({ users: [userId], chatId });
        if (xhr.status !== HttpStatus.Ok) {
          throw xhr;
        }

        toast.success('User deleted from the chat');
        await this.getChats();
      } else if (userId === null) {
        toast.error('User with this exact login was not found');
      } else {
        toast.error('Active chat ID is undefined');
      }
    } catch (xhr) {
      handleControllerError(xhr, 'Error during deleting user from the chat');
    }
  }

  public static async deleteChat() {
    try {
      const chatId = this.getActiveChatId();
      if (chatId === null) {
        toast.error('Active chat ID is undefined');
        return;
      }

      const xhr = await ChatApi.deleteChat({ chatId });

      if (xhr.status !== HttpStatus.Ok) {
        throw xhr;
      }

      toast.success('Chat deleted successfully');
      await this.getChats();
    } catch (xhr) {
      handleControllerError(xhr, 'Error during deleting chat');
    }
  }

  public static async updateChatAvatar(avatarFile: File): Promise<boolean> {
    try {
      const chatId = this.getActiveChatId();
      if (chatId === null) {
        toast.error('Active chat ID is undefined');
        return false;
      }

      const formData = new FormData();
      formData.append('avatar', avatarFile);
      formData.append('chatId', String(chatId));

      const xhr = await ChatApi.updateChatAvatar(formData);
      if (xhr.status !== HttpStatus.Ok) {
        throw xhr;
      }

      toast.success('Chat avatar updated successfully');
      await this.getChats();
      return true;
    } catch (xhr) {
      handleControllerError(xhr, 'Error during chat avatar update');
      return false;
    }
  }

  public static async getToken(id: number): Promise<string | null> {
    try {
      const xhr = await ChatApi.getChatToken(id);
      if (xhr.status === HttpStatus.Ok) {
        const tokenResponse = JSON.parse(xhr.responseText) as { token?: string };
        const token = tokenResponse.token;

        if (!token) {
          toast.error('Chat token is missing');
          return null;
        }

        store.setToken(token);
        return token;
      } else {
        throw xhr;
      }
    } catch (xhr) {
      handleControllerError(xhr, 'Error during getting token');
      return null;
    }
  }

  public static async getChatUsers(chatId?: number): Promise<TFoundUser[]> {
    try {
      const resolvedChatId = typeof chatId === 'number' ? chatId : this.getActiveChatId();

      if (resolvedChatId === null) {
        toast.error('Active chat ID is undefined');
        return [];
      }

      const xhr = await ChatApi.getChatUsers(resolvedChatId);
      if (xhr.status !== HttpStatus.Ok) {
        throw xhr;
      }

      const usersData = JSON.parse(xhr.responseText);
      if (!Array.isArray(usersData)) {
        return [];
      }

      return usersData.filter(
        (user): user is TFoundUser => typeof user?.id === 'number' && typeof user?.login === 'string'
      );
    } catch (xhr) {
      handleControllerError(xhr, 'Error during downloading chat users');
      return [];
    }
  }
}

export default ChatController;
