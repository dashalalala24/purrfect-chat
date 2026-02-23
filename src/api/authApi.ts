import { baseUrl } from './baseURL';
import HTTPTransport from '../httpTransport/httpTransport';

const base = baseUrl;

export class AuthApiClient {
  constructor(private readonly http: HTTPTransport = new HTTPTransport()) {}

  signUp(data: Record<string, unknown>) {
    return this.http.post(`${base}/auth/signup`, { data });
  }

  signIn(data: Record<string, unknown>) {
    return this.http.post(`${base}/auth/signin`, { data });
  }

  getUser() {
    return this.http.get(`${base}/auth/user`);
  }

  signOut() {
    return this.http.post(`${base}/auth/logout`);
  }
}

export const AuthApi = new AuthApiClient();
