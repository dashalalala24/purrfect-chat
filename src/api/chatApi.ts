import { baseUrl } from './baseUrl';
import HTTPTransport from '../httpTransport/httpTransport';

const base = baseUrl;
const chatApiInstance = new HTTPTransport();

export class ChatApi {
  static createNewChat(data: Record<string, unknown>) {
    return chatApiInstance.post(`${base}/chats`, { data });
  }

  static getAllChats() {
    return chatApiInstance.get(`${base}/chats`);
  }

  static getChatUsers(chatId: number) {
    return chatApiInstance.get(`${base}/chats/${chatId}/users`);
  }

  static getUserByLogin(data: Record<string, unknown>) {
    return chatApiInstance.post(`${base}/user/search`, { data });
  }

  static addUserToChat(data: Record<string, unknown>) {
    return chatApiInstance.put(`${base}/chats/users`, { data });
  }

  static deleteUserFromChat(data: Record<string, unknown>) {
    return chatApiInstance.delete(`${base}/chats/users`, { data });
  }

  static deleteChat(data: Record<string, unknown>) {
    return chatApiInstance.delete(`${base}/chats`, { data });
  }

  static updateChatAvatar(data: FormData) {
    return chatApiInstance.put(`${base}/chats/avatar`, { data });
  }

  static getChatToken(id: number) {
    return chatApiInstance.post(`${base}/chats/token/${id}`);
  }
}
