import { baseUrl } from './baseURL';
import HTTPTransport from '../httpTransport/httpTransport';

const base = baseUrl;
const authApiInstance = new HTTPTransport();

export class AuthApi {
  static signUp(data: Record<string, unknown>) {
    return authApiInstance.post(`${base}/auth/signup`, { data });
  }

  static signIn(data: Record<string, unknown>) {
    return authApiInstance.post(`${base}/auth/signin`, { data });
  }

  static getUser() {
    return authApiInstance.get(`${base}/auth/user`);
  }

  static signOut() {
    return authApiInstance.post(`${base}/auth/logout`);
  }
}
