import { baseUrl } from './baseURL';
import HTTPTransport from '../httpTransport/httpTransport';

const base = baseUrl;

export class UserApiClient {
  constructor(private readonly http: HTTPTransport = new HTTPTransport()) {}

  updatePassword(data: Record<string, unknown>) {
    return this.http.put(`${base}/user/password`, { data });
  }

  updateProfile(data: Record<string, unknown>) {
    return this.http.put(`${base}/user/profile`, { data });
  }

  updateProfileAvatar(data: FormData) {
    return this.http.put(`${base}/user/profile/avatar`, { data });
  }
}

export const UserApi = new UserApiClient();
