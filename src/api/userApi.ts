import { baseUrl } from './baseUrl';
import HTTPTransport from '../httpTransport/httpTransport';

const base = baseUrl;
const userApiInstance = new HTTPTransport();

export class UserApi {
  static updatePassword(data: Record<string, unknown>) {
    return userApiInstance.put(`${base}/user/password`, { data });
  }

  static updateProfile(data: Record<string, unknown>) {
    return userApiInstance.put(`${base}/user/profile`, { data });
  }

  static updateProfileAvatar(data: FormData) {
    return userApiInstance.put(`${base}/user/profile/avatar`, { data });
  }
}
