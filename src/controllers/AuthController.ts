import { AuthApi } from '../api/authApi';
import { HttpStatus } from '../consts/httpStatus';
import { Routes } from '../consts/routes';
import handleControllerError from '../services/handleControllerError';
import store from '../services/Store';
import toast from '../services/Toast';

const authErrorMessages = {
  badRequest: 'Bad request: Please check the data you entered and try again.',
  unauthorized: 'Unauthorized: Please sign in again.',
};

class AuthController {
  public static async signUp(data: Record<string, unknown>, retryOnConflict = true): Promise<boolean> {
    try {
      const xhr = await AuthApi.signUp(data);

      if (xhr.status === HttpStatus.Ok) {
        toast.success('Signed up successfully');

        await this.setUserDataToStore();

        window.router.go(Routes.Chats);
        return true;
      }

      if (retryOnConflict && this.isAlreadyInSystemError(xhr)) {
        toast.info('Active session found. Resetting and retrying sign up.');

        const hasResetSession = await this.resetActiveSession();
        if (hasResetSession) {
          return this.signUp(data, false);
        }
      } else {
        throw xhr;
      }
    } catch (error) {
      handleControllerError(error, 'Error during signing up', authErrorMessages);
      return false;
    }

    return false;
  }

  public static async signIn(data: Record<string, unknown>, retryOnConflict = true): Promise<boolean> {
    try {
      const xhr = await AuthApi.signIn(data);

      if (xhr.status === HttpStatus.Ok) {
        toast.success('Signed in successfully');

        await this.setUserDataToStore();

        window.router.go(Routes.Chats);
        return true;
      } else if (retryOnConflict && this.isAlreadyInSystemError(xhr)) {
        toast.info('Active session found. Resetting and retrying sign in.');

        const hasResetSession = await this.resetActiveSession();
        if (hasResetSession) {
          return this.signIn(data, false);
        }
      } else {
        throw xhr;
      }
    } catch (xhr) {
      handleControllerError(xhr, 'Error during signing in', authErrorMessages);
      return false;
    }

    return false;
  }

  public static async signOut() {
    try {
      const xhr = await AuthApi.signOut();

      if (xhr.status === HttpStatus.Ok) {
        this.clearAuthData();

        toast.success('Signed out successfully');

        window.router.go(Routes.SignIn);
      } else {
        throw xhr;
      }
    } catch (xhr) {
      handleControllerError(xhr, 'Error during signing out', authErrorMessages);
    }
  }

  public static async preloadUserForAppStart() {
    try {
      const xhr = await AuthApi.getUser();

      if (xhr.status === HttpStatus.Ok) {
        const userData = JSON.parse(xhr.responseText);
        store.setUser(userData);
        return;
      }

      if (xhr.status === HttpStatus.Unauthorized) {
        this.clearAuthData();
        return;
      }

      throw xhr;
    } catch (xhr) {
      if (xhr instanceof XMLHttpRequest && xhr.status === HttpStatus.Unauthorized) {
        this.clearAuthData();
        return;
      }

      handleControllerError(xhr, 'Failed to preload user data', authErrorMessages);
    }
  }

  private static async setUserDataToStore() {
    try {
      const xhr = await AuthApi.getUser();
      if (xhr.status === HttpStatus.Ok) {
        const userData = JSON.parse(xhr.responseText);
        store.setUser(userData);
      } else {
        throw xhr;
      }
    } catch (xhr) {
      handleControllerError(xhr, 'Failed to fetch user data', authErrorMessages);
    }
  }

  private static isAlreadyInSystemError(xhr: XMLHttpRequest): boolean {
    if (xhr.status !== HttpStatus.BadRequest || !xhr.responseText) {
      return false;
    }

    try {
      const responseErrorText = JSON.parse(xhr.responseText) as { reason?: string };
      return responseErrorText.reason === 'User already in system';
    } catch {
      return false;
    }
  }

  private static async resetActiveSession(): Promise<boolean> {
    try {
      const xhr = await AuthApi.signOut();

      if (xhr.status === HttpStatus.Ok || xhr.status === HttpStatus.Unauthorized) {
        this.clearAuthData();
        return true;
      }

      throw xhr;
    } catch (error) {
      handleControllerError(error, 'Failed to reset active session', authErrorMessages);
      return false;
    }
  }

  private static clearAuthData() {
    store.clearAuthData();
    sessionStorage.setItem('appState', '{}');
  }
}

export default AuthController;
