import { baseUrl } from './baseURL';
import HTTPTransport from '../httpTransport/httpTransport';

const base = baseUrl;

export class ChatApiClient {
  constructor(private readonly http: HTTPTransport = new HTTPTransport()) {}

  createNewChat(data: Record<string, unknown>) {
    return this.http.post(`${base}/chats`, { data });
  }

  getAllChats() {
    return this.http.get(`${base}/chats`);
  }

  getChatUsers(chatId: number) {
    return this.http.get(`${base}/chats/${chatId}/users`);
  }

  getUserByLogin(data: Record<string, unknown>) {
    return this.http.post(`${base}/user/search`, { data });
  }

  addUserToChat(data: Record<string, unknown>) {
    return this.http.put(`${base}/chats/users`, { data });
  }

  deleteUserFromChat(data: Record<string, unknown>) {
    return this.http.delete(`${base}/chats/users`, { data });
  }

  deleteChat(data: Record<string, unknown>) {
    return this.http.delete(`${base}/chats`, { data });
  }

  updateChatAvatar(data: FormData) {
    return this.http.put(`${base}/chats/avatar`, { data });
  }

  getChatToken(id: number) {
    return this.http.post(`${base}/chats/token/${id}`);
  }
}

export const ChatApi = new ChatApiClient();
